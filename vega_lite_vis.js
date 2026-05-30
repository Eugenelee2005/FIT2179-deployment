var chartSpecs = [
  // Bubble scatter: compares source countries by visitor trips, spend, nights and growth.
  { container: "#source_bubble", spec: "source_countries_bubble.vg.json" },

  // Flow map: keeps the existing visitor-origin map and limits lines to the top source countries.
  { container: "#flow_map", spec: "visitor_flow_map.vg.json" },

  // Slope chart: shows whether major source-country trip rankings moved between 2024 and 2025.
  { container: "#source_rank_slope", spec: "source_rank_slope.vg.json" },

  // Ranked bar chart: highlights source markets with the longest average stay.
  { container: "#avg_nights_source_bar", spec: "avg_nights_source_bar.vg.json" },

  // Donut chart: shows the share of visitor trips by main travel purpose with a year selector.
  { container: "#travel_purpose_donut", spec: "travel_purpose_donut.vg.json" },

  // Dumbbell chart: compares 2024 and 2025 visitor trips for each travel purpose.
  { container: "#travel_purpose_dumbbell", spec: "travel_purpose_dumbbell.vg.json" },

  // Waterfall chart: decomposes the total change in spend in Australia by travel purpose.
  { container: "#spending_waterfall", spec: "spending_waterfall.vg.json" },

  // Choropleth map: keeps the existing Australian state/territory activity map and controls.
  {
    container: "#choropleth_map",
    spec: "visitor_expenditure_choropleth.vg.json",
    options: { bind: "#choropleth_controls" }
  },

  // Lollipop chart: ranks tourism regions by 2025 visitor nights.
  { container: "#top_regions_lollipop", spec: "top_regions_lollipop.vg.json" },

  // Normalized stacked bar: compares capital city/gateway and regional shares by state.
  { container: "#capital_regional_stacked", spec: "capital_regional_stacked.vg.json" },

  // Waffle chart: represents 2025 major spending category shares as 100 squares.
  { container: "#spending_waffle", spec: "spending_waffle.vg.json" },

  // Heatmap: compares spending categories across visitor purposes.
  { container: "#spending_purpose_heatmap", spec: "spending_purpose_heatmap.vg.json" }
];

function embedVisualization(container, spec, options) {
  var embedOptions = Object.assign({
    actions: false,
    mode: "vega-lite",
    renderer: "svg"
  }, options);

  vegaEmbed(container, spec, embedOptions).then(function() {
    if (container === "#choropleth_map") {
      setupChoroplethLegendTitle();
    }
  }).catch(function(error) {
    var target = document.querySelector(container);
    if (target) {
      target.innerHTML = '<pre class="error">' + escapeHtml(String(error)) + '</pre>';
    }
    console.error(error);
  });
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function parseCsv(text) {
  var rows = [];
  var row = [];
  var cell = "";
  var inQuotes = false;

  for (var i = 0; i < text.length; i += 1) {
    var char = text[i];
    var next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      row.push(cell);
      if (row.some(function(value) { return value !== ""; })) {
        rows.push(row);
      }
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  var headers = rows.shift() || [];
  return rows.map(function(values) {
    return headers.reduce(function(record, header, index) {
      record[header] = values[index] || "";
      return record;
    }, {});
  });
}

function renderKpiCards() {
  var target = document.querySelector("#kpi_cards");
  if (!target) {
    return;
  }

  fetch("data/kpi_summary.csv")
    .then(function(response) {
      if (!response.ok) {
        throw new Error("Unable to load KPI summary");
      }
      return response.text();
    })
    .then(function(text) {
      var rows = parseCsv(text).sort(function(a, b) {
        return Number(a.sort_order) - Number(b.sort_order);
      });

      target.innerHTML = rows.map(function(row) {
        var change = Number(row.change_pct);
        var isPositive = change >= 0;
        var changeLabel = Math.abs(change).toFixed(1) + "% vs 2024";
        var changeClass = isPositive ? "kpi-change positive" : "kpi-change negative";
        var arrowClass = isPositive ? "kpi-arrow up" : "kpi-arrow down";
        var directionLabel = isPositive ? "Increase" : "Decrease";

        return [
          '<article class="kpi-card">',
          '<span class="kpi-value">' + escapeHtml(row.display_value) + '</span>',
          '<span class="kpi-label">' + escapeHtml(row.label) + '</span>',
          '<span class="' + changeClass + '" aria-label="' + directionLabel + ' ' + escapeHtml(changeLabel) + '">',
          '<span class="' + arrowClass + '" aria-hidden="true"></span>',
          '<span>' + escapeHtml(changeLabel) + '</span>',
          '</span>',
          "</article>"
        ].join("");
      }).join("");
    })
    .catch(function(error) {
      target.innerHTML = '<pre class="error">' + escapeHtml(String(error)) + '</pre>';
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

renderKpiCards();
chartSpecs.forEach(function(chart) {
  embedVisualization(chart.container, chart.spec, chart.options);
});
