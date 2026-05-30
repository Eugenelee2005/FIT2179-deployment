var choroplethMap = "visitor_expenditure_choropleth.vg.json";
var flowMap = "visitor_flow_map.vg.json";

function embedMap(container, spec, options) {
  var embedOptions = Object.assign({
    actions: false,
    renderer: "svg"
  }, options);

  vegaEmbed(container, spec, embedOptions).then(function(result) {
    if (container === "#choropleth_map") {
      setupChoroplethLegend();
    }

    // Access the Vega view instance as result.view.
  }).catch(function(error) {
    document.querySelector(container).innerHTML = '<pre class="error">' + error + '</pre>';
    console.error(error);
  });
}

function setupChoroplethLegend() {
  var controls = document.querySelector("#choropleth_controls");
  var legend = document.querySelector("#choropleth_legend");
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

  function getLegendConfig() {
    var view = getCheckedValue(["Change 2024-2025", "2024 value", "2025 value"]);
    var metric = getCheckedValue(["Expenditure ($M)", "Visitor trips ('000)"]);

    if (view === "Change 2024-2025") {
      return {
        title: metric === "Expenditure ($M)" ? "Change in expenditure (%)" : "Change in visitor trips (%)",
        gradient: "linear-gradient(90deg, #f97316 0%, #9ca3af 50%, #1d4ed8 100%)",
        labels: ["Decrease", "No change", "Increase"]
      };
    }

    if (metric === "Expenditure ($M)") {
      return {
        title: view === "2024 value" ? "2024 expenditure ($M)" : "2025 expenditure ($M)",
        gradient: "linear-gradient(90deg, #bfdbfe 0%, #60a5fa 35%, #2563eb 70%, #1e3a8a 100%)",
        labels: ["Lower", "", "Higher"]
      };
    }

    return {
      title: view === "2024 value" ? "2024 visitor trips ('000)" : "2025 visitor trips ('000)",
      gradient: "linear-gradient(90deg, #ddd6fe 0%, #a78bfa 35%, #7c3aed 70%, #4c1d95 100%)",
      labels: ["Lower", "", "Higher"]
    };
  }

  function updateSvgLegendTitle(title) {
    var legendTitles = [
      "Selected map value",
      "Change in expenditure (%)",
      "Change in trips (%)",
      "Expenditure 2024 ($M)",
      "Expenditure 2025 ($M)",
      "Trips 2024 ('000)",
      "Trips 2025 ('000)"
    ];
    var textNodes = document.querySelectorAll("#choropleth_map svg text");

    Array.prototype.forEach.call(textNodes, function(textNode) {
      if (legendTitles.indexOf(textNode.textContent) !== -1) {
        textNode.textContent = title;
      }
    });
  }

  function updateLegend() {
    var config = getLegendConfig();

    if (legend) {
      legend.innerHTML = ''
        + '<div class="legend-heading">Legend</div>'
        + '<div class="legend-title">' + config.title + '</div>'
        + '<div class="legend-gradient" style="background: ' + config.gradient + '"></div>'
        + '<div class="legend-labels">'
        + '<span>' + config.labels[0] + '</span>'
        + '<span>' + config.labels[1] + '</span>'
        + '<span>' + config.labels[2] + '</span>'
        + '</div>';
    }

    updateSvgLegendTitle(config.title);
  }

  updateLegend();
  controls.addEventListener("change", function() {
    setTimeout(updateLegend, 0);
    setTimeout(updateLegend, 100);
  });
}

embedMap("#choropleth_map", choroplethMap, {
  bind: "#choropleth_controls"
});
embedMap("#flow_map", flowMap);
