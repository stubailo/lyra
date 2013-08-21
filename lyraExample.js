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

$(function() {
  var spec = {
    "data": [
      {
        "name": "table",
        "items": [
          {"x": 1,  "y": 28, "z": new Date("July 1, 2013")}, {"x": 2,  "y": 55, "z": new Date("July 3, 2013")},
          {"x": 3,  "y": 43, "z": new Date("July 4, 2013")}, {"x": 4,  "y": 91, "z": new Date("July 5, 2013")},
          {"x": 5,  "y": 81, "z": new Date("July 6, 2013")}, {"x": 6,  "y": 53, "z": new Date("July 7, 2013")},
          {"x": 7,  "y": 19, "z": new Date("July 8, 2013")}, {"x": 8,  "y": 87, "z": new Date("July 9, 2013")},
          {"x": 9,  "y": 52, "z": new Date("July 10, 2013")}, {"x": 10, "y": 48, "z": new Date("July 11, 2013")},
          {"x": 11, "y": 24, "z": new Date("July 12, 2013")}, {"x": 12, "y": 49, "z": new Date("July 14, 2013")},
          {"x": 13, "y": 87, "z": new Date("July 16, 2013")}, {"x": 14, "y": 66, "z": new Date("July 17, 2013")},
          {"x": 15, "y": 17, "z": new Date("July 18, 2013")}, {"x": 16, "y": 27, "z": new Date("July 19, 2013")},
          {"x": 17, "y": 68, "z": new Date("July 21, 2013")}, {"x": 18, "y": 16, "z": new Date("July 23, 2013")},
          {"x": 19, "y": 49, "z": new Date("July 26, 2013")}, {"x": 20, "y": 15, "z": new Date("July 31, 2013")}
        ]
      },
      {
        "name": "barData",
        "type": "bar",
        "source": "data:table",
        "domain": "x"
      }
    ],
    "areas": [
      {
        "name": "area1"
      }
    ],
    "scales": [
      {
        "name": "x",
        "type": "linear",
        "rangeBegin": 0,
        "rangeEnd": "areas:area1.height",
        "domainBegin": 20,
        "domainEnd": 0
      },
      {
        "name": "y",
        "type": "linear",
        "rangeBegin": 0,
        "rangeEnd": "areas:area1.height",
        "domainBegin": 100,
        "domainEnd": 0
      },
      {
        "name": "z",
        "type": "time",
        "rangeBegin": 0,
        "rangeEnd": "areas:area1.width",
        "domainBegin": new Date("July 1, 2013"),
        "domainEnd": new Date("July 31, 2013")
      }
    ],
    "marks": [
      {
        "name": "symbol",
        "type": "circle",
        "source": "data:table",
        "area": "areas:area1",
        "properties": {
          "cx": {
            "value": "z",
            "scale": "z"
          },
          "cy": {
            "value": "x",
            "scale": "x"
          },
          "r": {
            "value": 5
          },
          "fill": {
            "value": "red"
          }
        }
      },
      {
        "name": "symbol2",
        "type": "line",
        "source": "data:table",
        "area": "areas:area1",
        "properties": {
          "x": {
            "value": "z",
            "scale": "z"
          },
          "y": {
            "value": "y",
            "scale": "y"
          },
          "interpolate": {
            "value" : "linear"
          },
          "stroke-width" : {
            "value" : 3
          },
          "stroke" : {
            "value" : "blue"
          },
          "fill" : {
            "value" : "none"
          }
        }
      }
    ],
    "axes": [
      {
      "name": "x",
      "area": "areas:area1",
      "scale": "scales:x",
      "orient": "left",
      "ticks": 10,
      "axisWidth": 30,
      "location": "left"
      },
      {
      "name": "y",
      "area": "areas:area1",
      "scale": "scales:y",
      "orient": "right",
      "ticks": 10,
      "axisWidth": 30,
      "location": "right"
      },
      {
      "name": "z",
      "area": "areas:area1",
      "scale": "scales:z",
      "orient": "bottom",
      "ticks": 5,
      "location": "bottom",
      "gridline": "#aaaaff",
      "axisWidth": 30
      }
    ],
    "labels": [
      {
        "name": "title",
        "area": "areas:area1",
        "text": "Iceland GDP vs Sesame Street Viewers",
        "location": "top"
      },
      {
        "name": "labelY",
        "area": "areas:area1",
        "text": "GDP of Iceland (Thousands of Dollars)",
        "location": "left",
        "size": 12
      },
      {
        "name": "labelY2",
        "area": "areas:area1",
        "text": "Viewers (in hundreds)",
        "location": "right",
        "size": 12
      }
    ],
    "interactions": [
      {
        "type": "pan",
        "scale": "x",
        "axis": "x",
        "direction": "n"
      },
      {
        "type": "pan",
        "scale": "y",
        "axis": "y",
        "direction": "n"
      },
      {
        "type": "pan",
        "scale": "z",
        "axis": "z",
        "direction": "e"
      },
      {
        "type": "zoom",
        "axis": "z",
        "scale": "z",
        "zoomFactor": 0.05
      },
      {
        "type": "zoom",
        "axis": "x",
        "scale": "x",
        "zoomFactor": 0.05
      },
      {
        "type": "zoom",
        "axis": "y",
        "scale": "y",
        "zoomFactor": 0.05
      }
    ]
  }

  el = $("#container").get(0);
  lyra = new Lyra.createChart(spec, el);
/*
  setInterval(function() {
    lyra.view.getModel().getContext().getNode("areas", "area1").set({
      "totalWidth": 400 + 200 * Math.sin((new Date()).getTime() / 1000),
      "totalHeight": 300 + 150 * Math.sin((new Date()).getTime() / 900)
    });
  }, 10);
*/

});
