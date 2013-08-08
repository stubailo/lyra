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
        "name": "area1",
        "height": 300,
        "width": 400,
        "paddingRight": 50,
        "paddingTop": 100,
        "paddingBottom": 50
      }
    ],
    "scales": [
      {
        "name": "x",
        "type": "linear",
        "rangeBegin": 0,
        "rangeEnd": "areas:area1.width",
        "domainBegin": 0,
        "domainEnd": 20
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
            "value": "x",
            "scale": "x"
          },
          "cy": {
            "value": "y",
            "scale": "y"
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
            "value": "x",
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
      "orient": "top",
      "ticks": 20,
      "location": "top",
      "gridline": "lightgray"
      },
      {
      "name": "y",
      "area": "areas:area1",
      "scale": "scales:y",
      "orient": "right",
      "ticks": 10,
      "location": "right",
      "gridline": "#ffaaaa"
      },
      {
      "name": "z",
      "area": "areas:area1",
      "scale": "scales:z",
      "orient": "bottom",
      "ticks": 5,
      "location": "bottom",
      "gridline": "#aaaaff"
      }
    ],
    "interactions": [
      {
        "type": "clickPrint",
        "mark": "symbol"
      },
      {
        "type": "pan",
        "scale": "x",
        "axis": "x",
        "direction": "e"
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
        "type": "clickPrint",
        "mark": "symbol2"
      },
      {
        "type" : "colorHover",
        "mark": "symbol2"
      },
      {
        "type": "zoom",
        "axis": "z",
        "scale": "z",
        "zoomFactor": 0.05
      }
    ]
  }

  el = $("#container").get(0);
  lyra = new Lyra(spec, el);
/*
  setInterval(function() {
    lyra.model.context.getNode("areas", "area1").set({
      "width": 400 + 200 * Math.sin((new Date()).getTime() / 1000),
      "height": 300 + 150 * Math.sin((new Date()).getTime() / 900)
    });

    lyra.model.context.getNode("axes", "x").set({
      "ticks": Math.floor(20 + 10 * Math.sin((new Date()).getTime() / 1000))
    });
  }, 10);

  setInterval(function() {
    var fill = '#'+Math.floor(Math.random()*16777215).toString(16);
    lyra._viewContext.getNode("marks", "symbol").set({
      "fill": function() {return fill}
    });
  }, 1000);
*/

});
