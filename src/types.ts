/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { GraphQLResolveInfo } from "graphql";
import { PromiseOrValue } from "graphql/jsutils/PromiseOrValue";

export type OnFetchPluginConfig = {
  source: string;
  handler: string;
};

export type OnFetchHandler<TContext> = (
  payload: OnFetchHookPayload<TContext>
) => PromiseOrValue<void | OnFetchHookDone>;

export interface OnFetchHookDonePayload {
  response: Response;
  setResponse: (response: Response) => void;
}
export type OnFetchHookDone = (
  payload: OnFetchHookDonePayload
) => PromiseOrValue<void>;

export type OnFetchHookPayload<TContext> = {
  url: string;
  options: RequestInit;
  context: TContext;
  info: GraphQLResolveInfo;
};
