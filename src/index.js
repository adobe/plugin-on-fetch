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

async function onFetchPlugin(buildConfig) {
  try {
    const { baseDir } = buildConfig;
    const memoizedFns = {};

    // config is an object with onFetch keys as numbers along with other keys, to only get onFetch keys we filter others out
    const onFetchConfig = Object.keys(buildConfig)
      .filter((key) => +key || +key === 0)
      .reduce((acc, key) => {
        const { source, ...rest } = buildConfig[key];
        acc[source] = rest;
        return acc;
      }, {});

    return {
      async onFetch(executionConfig /* OnFetchHookPayload */) {
        if (
          !executionConfig.info ||
          !onFetchConfig[executionConfig.info.sourceName]
        ) {
          return;
        }

        const sourceName = executionConfig.info.sourceName;

        const { handler } = onFetchConfig[executionConfig.info.sourceName];
        let handlerFn = null;

        if (memoizedFns[sourceName]) {
          handlerFn = memoizedFns[sourceName];
        } else {
          try {
            const handlerFilePath = `${baseDir}/${handler}`;
            const maybeHandlerFn = await import(handlerFilePath);

            if (typeof maybeHandlerFn === "function") {
              handlerFn = maybeHandlerFn;
            } else if (typeof maybeHandlerFn.default === "function") {
              handlerFn = maybeHandlerFn.default;
            } else {
              throw new Error(
                `Unable to find handler function for ${sourceName}`
              );
            }

            memoizedFns[sourceName] = handlerFn;
          } catch (err) {
            console.error("Unable to load handler", err);
          }
        }

        try {
          if (handlerFn) {
            const { fetchFn, setFetchFn, ...handlerPayload } = executionConfig; // dont give handler access to fetch and set fetch

            await handlerFn(handlerPayload);
          } else {
            return;
          }
        } catch (err) {
          console.error("Unable to execute handler", err);
        }
      },
    };
  } catch (err) {
    console.error("Error while initializing onFetch plugin", err);

    return {};
  }
}

module.exports = onFetchPlugin;
