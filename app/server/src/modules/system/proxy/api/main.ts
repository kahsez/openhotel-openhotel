import { ProxyRequestType } from "shared/types/api.types.ts";
import { pingRequest } from "./ping.request.ts";
import { roomListRequest } from "./room-list.request.ts";

export const requestList: ProxyRequestType[] = [pingRequest, roomListRequest];