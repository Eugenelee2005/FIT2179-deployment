var choroplethMap = "visitor_expenditure_choropleth.vg.json";
var flowMap = "visitor_flow_map.vg.json";

function embedMap(container, spec, options) {
  var embedOptions = Object.assign({
    actions: false,
    renderer: "svg"
  }, options);

  vegaEmbed(container, spec, embedOptions).then(function(result) {
    // Access the Vega view instance as result.view.
  }).catch(function(error) {
    document.querySelector(container).innerHTML = '<pre class="error">' + error + '</pre>';
    console.error(error);
  });
}

embedMap("#choropleth_map", choroplethMap, {
  bind: "#choropleth_controls"
});
embedMap("#flow_map", flowMap);
