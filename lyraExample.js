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
    "scales": [
      {
        "name": "x",
        "type": "linear",
        "range": [0, 400],
        "domain": [0, 20]
      },
      {
        "name": "y",
        "type": "linear",
        "range": [0, 300],
        "domain": [0, 100]
      },
      {
        "name": "z",
        "type": "linear",
        "range": [0, 250],
        "domain": [0, 100]
      }
    ],
    "marks": [
      {
        "name": "symbol",
        "type": "symbol",
        "source": "table",
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
        "type": "symbol",
        "source": "table",
        "properties": {
          "cx": {
            "value": "x",
            "scale": "x"
          },
          "cy": {
            "value": "y",
            "scale": "z"
          },
          "r": {
            "value": 5
          },
          "fill": {
            "value": "blue"
          }
        }
      }
    ],
    "interactions": [
      {
        "type": "clickPrint",
        "mark": "symbol"
      }
    ]
  }

  el = $("#container").get(0);
  lyra = new Lyra(spec, el);

  lyra.model.context.getNode("DataSet", "table").items = [
          {"x": 1,  "y": 28}, {"x": 2,  "y": 55},
          {"x": 3,  "y": 43}, {"x": 4,  "y": 91},
          {"x": 5,  "y": 81}, {"x": 6,  "y": 53},
          {"x": 7,  "y": 19}, {"x": 8,  "y": 87},
          {"x": 9,  "y": 52}, {"x": 10, "y": 48},
          {"x": 11, "y": 24}, {"x": 12, "y": 49},
          {"x": 13, "y": 87}, {"x": 14, "y": 66},
          {"x": 15, "y": 17}, {"x": 16, "y": 27},
          {"x": 17, "y": 80}, {"x": 18, "y": 16},
          {"x": 19, "y": 49}, {"x": 20, "y": 15}
        ];
});
