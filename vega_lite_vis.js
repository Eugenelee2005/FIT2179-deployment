var choroplethMap = "visitor_expenditure_choropleth.vg.json";
var flowMap = "visitor_flow_map.vg.json";

function embedMap(container, spec, options) {
  var embedOptions = Object.assign({
    actions: false,
    renderer: "svg"
  }, options);

  vegaEmbed(container, spec, embedOptions).then(function(result) {
    if (container === "#choropleth_map") {
      setupChoroplethLegendTitle();
    }

    // Access the Vega view instance as result.view.
  }).catch(function(error) {
    document.querySelector(container).innerHTML = '<pre class="error">' + error + '</pre>';
    console.error(error);
  });
}

function setupChoroplethLegendTitle() {
  var controls = document.querySelector("#choropleth_controls");
  if (!controls) {
    return;
  }

  function getCheckedValue(options) {
    var checkedInputs = Array.prototype.slice.call(
      controls.querySelectorAll("input[type='radio']:checked")
    );

    return options.find(function(option) {
      return checkedInputs.some(function(input) {
        return input.value === option;
      });
    });
  }

  function getLegendTitle() {
    var view = getCheckedValue(["Change 2024-2025", "2024 value", "2025 value"]);
    var metric = getCheckedValue(["Expenditure ($M)", "Visitor trips ('000)"]);

    if (view === "Change 2024-2025") {
      return metric === "Expenditure ($M)" ? "Change in expenditure (%)" : "Change in trips (%)";
    }

    if (metric === "Expenditure ($M)") {
      return view === "2024 value" ? "Expenditure 2024 ($M)" : "Expenditure 2025 ($M)";
    }

    return view === "2024 value" ? "Trips 2024 ('000)" : "Trips 2025 ('000)";
  }

  function updateLegendTitle() {
    var legendTitles = [
      "Selected map value",
      "Change in expenditure (%)",
      "Change in trips (%)",
      "Expenditure 2024 ($M)",
      "Expenditure 2025 ($M)",
      "Trips 2024 ('000)",
      "Trips 2025 ('000)"
    ];
    var title = getLegendTitle();
    var textNodes = document.querySelectorAll("#choropleth_map svg text");

    Array.prototype.forEach.call(textNodes, function(textNode) {
      if (legendTitles.indexOf(textNode.textContent) !== -1) {
        textNode.textContent = title;
      }
    });
  }

  updateLegendTitle();
  controls.addEventListener("change", function() {
    setTimeout(updateLegendTitle, 0);
    setTimeout(updateLegendTitle, 100);
  });
}

embedMap("#choropleth_map", choroplethMap, {
  bind: "#choropleth_controls"
});
embedMap("#flow_map", flowMap);
