/*
 * Copyright 2013 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module Lyra {
    /**
      Supports a small subset of Backbone Model functionality, namely:
      - Setting properties
      - Getting properties
      - Listening to "change" event
      - Listening to "change:property" event
    */
    export class ListenableDictionary {
        public attributes: Object;
        private handlers: {[eventName: string]: WrappedHandler[]};
        private nextHandlerId: number;

        public defaults() {
            return {};
        }

        constructor() {
            this.attributes = {};
            this.handlers = {};
            this.nextHandlerId = 0;

            this.set(this.defaults());
        }

        public set(properties: Object);
        public set(key: string, value: any);
        public set(keyOrProperties: string, value?: any) {
            if (value === undefined) {
                this.setFromDictionary(keyOrProperties);
            } else {
                this.setFromKeyValue(keyOrProperties, value);
            }
        }

        /**
            Calls event handlers for some events.

            Accepts a single event, an array of events, or a space-separated list of events.
        */
        public trigger(keyOrSpaceSeparatedKeys: string);
        public trigger(arrayOfKeys: string[]);
        public trigger(keysArrayOrString: any) {
            var keys: string[] = [];

            if (keysArrayOrString instanceof Array) {
                keys = keysArrayOrString;
            } else if (typeof keysArrayOrString === "string") {
                var whiteSpace = /\s+/;
                if (whiteSpace.test(keysArrayOrString)) {
                    keys = keysArrayOrString.split(whiteSpace);
                } else {
                    keys = [keysArrayOrString];
                }
            }

            var handlersCalled: {[handlerId: number]: boolean} = {};

            if (keys.length > 0) {
                _.each(keys, (key: string) => {
                    _.each(this.handlers[key], (handler: WrappedHandler) => {
                        if (!handlersCalled[handler.id]) {
                            handler.func();
                            handlersCalled[handler.id] = true;
                        }
                    });
                });
            }
        }

        private setFromDictionary(properties: Object) {
            var handlersCalled: {[handlerId: number]: boolean} = {};
            var propsChanged: string[] = [];

            for (var key in properties) {
                if (properties.hasOwnProperty(key)) {
                    var newValue = properties[key];
                    var oldValue = this.attributes[key];

                    // do nothing if the new value is the same
                    if (_.isEqual(oldValue, newValue)) {
                        // do nothing
                    } else {
                        propsChanged.push(key);
                        this.attributes[key] = newValue;
                    }
                }
            }

            var eventsToTrigger = [];

            if (propsChanged.length > 0) {
                eventsToTrigger.push("change");
                _.each(propsChanged, (property) => {
                    eventsToTrigger.push("change:" + property);
                });

                this.trigger(eventsToTrigger);
            }
        }

        private setFromKeyValue(key: string, value: any): void {
            var dict = {};
            dict[key] = value;
            this.setFromDictionary(dict);
        }

        public get(key: string): any {
            return this.attributes[key];
        }

        public on(key: string, handler: any) {
            var keys;

            // potentially split first argument
            var whiteSpace = /\s+/;
            if (whiteSpace.test(key)) {
                keys = key.split(whiteSpace);
            } else {
                keys = [key];
            }

            var id: number;
            id = this.nextHandlerId;
            this.nextHandlerId++;

            var wrappedHandler: WrappedHandler = {
                func: handler,
                id: id
            };

            _.each(keys, (key: string) => {
                if (this.handlers[key] === undefined) {
                    this.handlers[key] = [];
                }
                this.handlers[key].push(wrappedHandler);
            });
        }
    }

    // Interface for an object that wraps a function in order to give it a unique ID
    interface WrappedHandler {
        func: () => void;
        id: number;
    }
}
