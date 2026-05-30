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

  if (!controls || !legend) {
    return;
  }

  function getSelectedView() {
    var checked = controls.querySelector("input[type='radio']:checked");
    return checked ? checked.value : "% change expenditure";
  }

  function getLegendConfig() {
    var view = getSelectedView();

    if (view === "% change expenditure") {
      return {
        title: "Change in expenditure (%)",
        gradient: "linear-gradient(90deg, #e66101 0%, #b8b8b8 50%, #2166ac 100%)",
        labels: ["Lower", "Middle", "Higher"]
      };
    }

    if (view === "2024 expenditure") {
      return {
        title: "2024 expenditure ($M)",
        gradient: "linear-gradient(90deg, #dbeafe 0%, #93c5fd 35%, #3b82f6 70%, #1e3a8a 100%)",
        labels: ["Lower", "", "Higher"]
      };
    }

    if (view === "2025 expenditure") {
      return {
        title: "2025 expenditure ($M)",
        gradient: "linear-gradient(90deg, #dbeafe 0%, #93c5fd 35%, #3b82f6 70%, #1e3a8a 100%)",
        labels: ["Lower", "", "Higher"]
      };
    }

    if (view === "2024 visitor trips") {
      return {
        title: "2024 visitor trips ('000)",
        gradient: "linear-gradient(90deg, #ede9fe 0%, #c4b5fd 35%, #8b5cf6 70%, #4c1d95 100%)",
        labels: ["Lower", "", "Higher"]
      };
    }

    return {
      title: "2025 visitor trips ('000)",
      gradient: "linear-gradient(90deg, #ede9fe 0%, #c4b5fd 35%, #8b5cf6 70%, #4c1d95 100%)",
      labels: ["Lower", "", "Higher"]
    };
  }

  function updateLegend() {
    var config = getLegendConfig();

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
