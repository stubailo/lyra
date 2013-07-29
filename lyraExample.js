$(function() {
  var spec = {
    "data": [
      {
        "name": "table",
        "items": [
          {"x": 1,  "y": 28}, {"x": 2,  "y": 55},
          {"x": 3,  "y": 43}, {"x": 4,  "y": 91},
          {"x": 5,  "y": 81}, {"x": 6,  "y": 53},
          {"x": 7,  "y": 19}, {"x": 8,  "y": 87},
          {"x": 9,  "y": 52}, {"x": 10, "y": 48},
          {"x": 11, "y": 24}, {"x": 12, "y": 49},
          {"x": 13, "y": 87}, {"x": 14, "y": 66},
          {"x": 15, "y": 17}, {"x": 16, "y": 27},
          {"x": 17, "y": 68}, {"x": 18, "y": 16},
          {"x": 19, "y": 49}, {"x": 20, "y": 15}
        ]
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
        "rangeEnd": "areas:area2.height",
        "domainBegin": 100,
        "domainEnd": 0
      }
    ],
    "marks": [
      {
        "name": "symbol",
        "type": "circle",
        "source": "table",
        "area": "area1",
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
        "area": "area2",
        "properties": {
          "x": {
            "value": "x",
            "scale": "x"
          },
          "y": {
            "value": "y",
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
          },
          "heyo" : {
            "value" : "areas:area1.height"
          }
        }
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
        "mark": "symbol2",
        "direction": "e"
      },
      {
        "type": "pan",
        "scale": "y",
        "mark": "symbol2",
        "direction": "n"
      },
      {
        "type": "pan",
        "scale": "z",
        "mark": "symbol2",
        "direction": "n"
      },
      {
        "type": "pan",
        "scale": "x",
        "mark": "symbol",
        "direction": "e"
      },
      {
        "type": "pan",
        "scale": "y",
        "mark": "symbol",
        "direction": "n"
      },
      {
        "type": "pan",
        "scale": "z",
        "mark": "symbol",
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
        "area": "area1",
        "scale": "x",
        "zoomFactor": 0.01
      }
    ],
  	"axes": [
  	  {
  		"name": "x",
  		"area": "areas:area1",
  		"scale": "scales:x",
  		"orient": "bottom",
  		"ticks": 20,
  		"location": "bottom",
      "gridline": "lightgray"
  	  },
  	  {
  		"name": "y1",
  		"area": "areas:area1",
  		"scale": "scales:y",
  		"orient": "left",
  		"ticks": 20,
  		"location": "left",
      "gridline": "lightgray"
  	  },
      {
      "name": "y2",
      "area": "areas:area1",
      "scale": "scales:y",
      "orient": "left",
      "ticks": 25,
      "location": "left"
      },
      {
      "name": "y3",
      "area": "areas:area1",
      "scale": "scales:y",
      "orient": "right",
      "ticks": 17,
      "location": "right"
      },
      {
      "name": "x",
      "area": "areas:area2",
      "scale": "scales:x",
      "orient": "bottom",
      "ticks": 20,
      "location": "bottom",
      "gridline": "lightgray"
      },
      {
      "name": "y1",
      "area": "areas:area2",
      "scale": "scales:y",
      "orient": "left",
      "ticks": 20,
      "location": "left",
      "gridline": "lightgray"
      }
  	]
  }

  el = $("#container").get(0);
  lyra = new Lyra(spec, el);
  lyra.render();
  //lyra.model.context.getNode("Area", "area1").set("height", 100);
});
