import { container, ContainerComponent } from "@tulib/tulip";
import { logoComponent } from "./logo.component";
import { System } from "system";
import { Event } from "shared/enums";
import { roomComponent } from "modules/room";
import { getRandomNumber } from "shared/utils";
import { humanComponent } from "modules/human";
import { logComponent } from "./log.component";

export const mainComponent: ContainerComponent = async () => {
  await System.proxy.preConnect();
  const $container = await container();

  const $logo = await logoComponent();
  await $logo.setPosition({ x: 8, y: 8 });
  $container.add($logo);

  const logs = await logComponent();
  await logs.setZIndex(1_000);
  $container.add(logs);

  let $room;

  let humanList = [];

  System.proxy.on<any>(Event.TEST, async ({ username }) => {
    console.log("hello there!", username);
  });
  System.proxy.on<any>(Event.ADD_HUMAN, async ({ user, position, isOld }) => {
    const human = await humanComponent({ user });
    await human.setIsometricPosition(position);
    humanList.push(human);
    $room.add(human);

    if (!isOld) logs.addLog(`${user.username} joined!`);
  });
  System.proxy.on<any>(Event.REMOVE_HUMAN, ({ user }) => {
    const currentHuman = humanList.find(
      (human) => human.getUser().id === user.id,
    );
    $room.remove(currentHuman);
    humanList = humanList.filter((human) => human.getUser().id !== user.id);
    logs.addLog(`${user.username} left!`);
  });
  System.proxy.on<any>(Event.MOVE_HUMAN, async ({ userId, position }) => {
    const human = humanList.find((human) => human.getUser().id === userId);

    human.setIsometricPosition({ ...position, y: 0 });
  });

  await System.proxy.connect();

  System.proxy.on<any>(Event.LOAD_ROOM, async ({ room }) => {
    $room = await roomComponent({ layout: room.layout });
    $container.add($room);

    setInterval(() => {
      System.proxy.emit(Event.TEST, {});
    }, 2000);
  });

  System.proxy.emit(Event.JOIN_ROOM, {
    roomId: `test_${getRandomNumber(0, 1)}`,
  });

  return $container.getComponent(mainComponent);
};