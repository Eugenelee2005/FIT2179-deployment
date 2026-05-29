var flowMap = "js/visitor_flow_map.vl.json";

vegaEmbed("#flow_map", flowMap, {
  actions: false,
  renderer: "svg"
}).then(function(result) {
  // Access the Vega view instance as result.view.
}).catch(function(error) {
  document.querySelector("#flow_map").innerHTML = '<pre class="error">' + error + '</pre>';
  console.error(error);
});
