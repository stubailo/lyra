$(function() {
  var spec = {
    "data": [
      {
        "name": "table",
        "items": [
          {"x": 1,  "y": 28, "z": 1200}, {"x": 2,  "y": 55, "z": 1230},
          {"x": 3,  "y": 43, "z": 1100}, {"x": 4,  "y": 91, "z": 1120},
          {"x": 5,  "y": 81, "z": 1300}, {"x": 6,  "y": 53, "z": 1350},
          {"x": 7,  "y": 19, "z": 1400}, {"x": 8,  "y": 87, "z": 1560},
          {"x": 9,  "y": 52, "z": 1500}, {"x": 10, "y": 48, "z": 1460},
          {"x": 11, "y": 24, "z": 1700}, {"x": 12, "y": 49, "z": 1680},
          {"x": 13, "y": 87, "z": 1600}, {"x": 14, "y": 66, "z": 1660},
          {"x": 15, "y": 17, "z": 1900}, {"x": 16, "y": 27, "z": 1990},
          {"x": 17, "y": 68, "z": 1800}, {"x": 18, "y": 16, "z": 1880},
          {"x": 19, "y": 49, "z": 1000}, {"x": 20, "y": 15, "z": 1200}
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
        "width": 400
      },
      {
        "name": "area2",
        "height": 300,
        "width": 400
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
        "type": "linear",
        "rangeBegin": 0,
        "rangeEnd": "areas:area1.height",
        "domainBegin": 1000,
        "domainEnd": 2000
      },
      {
        "name": "opacityY",
        "type": "linear",
        "rangeBegin": 0,
        "rangeEnd": 1,
        "domainBegin": 0,
        "domainEnd": 100
      }
    ],
    "marks": [
    {
        "name": "symbol3",
        "type": "rect",
        "source": "barData",
        "area": "area1",
        "properties": {
          "x": {
            "value": "barDomain",
            "scale": "x"
          },
          "y": {
            "value": "y",
            "scale": "y"
          },
          "x2": {
            "value": "barDomain2",
            "scale": "x"
          },
          "y2": {
            "value": "barBase",
            "scale": "y"
          },
          "fill": {
            "value": "green"
          },
          "fill-opacity": {
            "value": "y",
            "scale": "opacityY"
          }
        }
      },
      {
        "name": "symbol",
        "type": "circle",
        "source": "table",
        "area": "area2",
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
        "source": "table",
        "area": "area1",
        "properties": {
          "x": {
            "value": "x",
            "scale": "x"
          },
          "y": {
            "value": "z",
            "scale": "z"
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
      "orient": "bottom",
      "ticks": 20,
      "location": "bottom"
      },
      {
      "name": "y",
      "area": "areas:area1",
      "scale": "scales:y",
      "orient": "left",
      "ticks": 10,
      "location": "left",
      "gridline": "#aaaaff"
      },
      {
      "name": "z",
      "area": "areas:area1",
      "scale": "scales:z",
      "orient": "left",
      "ticks": 10,
      "location": "left"
      }, 
      {
      "name": "x2",
      "area": "areas:area2",
      "scale": "scales:x",
      "orient": "bottom",
      "ticks": 20,
      "location": "bottom"
      },
      {
      "name": "y2",
      "area": "areas:area2",
      "scale": "scales:y",
      "orient": "left",
      "ticks": 10,
      "location": "left",
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
        "direction": "n"
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
        "axis": "x",
        "scale": "x",
        "zoomFactor": 0.01
      },
      {
        "type": "addPoint",
        "mark": "symbol",
        "area": "area1",
        "domainScale": "x",
        "rangeScale": "y",
        "domain": "x",
        "range" : "y"
      }
    ]
  }

  el = $("#container").get(0);
  lyra = new Lyra(spec, el);
  lyra.render();
  //lyra.model.context.getNode("Area", "area1").set("height", 100);

  console.log(lyra.model.context.getNode("data:barData").items);
});
