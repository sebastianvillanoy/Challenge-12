// Cosole log the full data
d3.json("samples.json").then(function(data){console.log(data)}); 

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    let samplesArray = data.samples

    // 4. Create a variable that filters the samples for the object with the desired sample number.\
    let filteredArray = samplesArray.filter(sampleObj => sampleObj.id == sample); 

    //  5. Create a variable that holds the first sample in the array.
    let result = filteredArray[0];  

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    let otuIds = result.otu_ids
    let otuLabels = result.otu_labels
    let sampleValues = result.sample_values

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 

    // Initialize an empty array. This will eventually turn into an array of arrays.
    let idValueObj = []

    // Store otuIds and its corresponding sampleValues and otuLabels in an array. Then add this array into the idValueObj array
    for (var i = 0; i < otuIds.length; i++){
      idValueObj.push([otuIds[i], sampleValues[i], otuLabels[i]])
    }

    // Sort the idValueObj array in descending order of sampleValues and slice the array of arrays to get only the top 10 arrays
    let idValueObjDesc = idValueObj.sort((arr1,arr2)=> arr2[1]-arr1[1]).slice(0,10); 

    // Console log the sorted array of arrays 
    console.log(idValueObjDesc)

    // Assign values to the xticks, yticks, and hovertext by iterating through the sorted array and indexing the arrays within for the required data
    var xticks = idValueObjDesc.map(arr => arr[1]).reverse()
    var yticks = idValueObjDesc.map(arr => `OTU ${arr[0]}`).reverse()
    var hoverText = idValueObjDesc.map(arr => arr[2]).reverse()
  
    // Console log the x and y values that will be used for the plot
    console.log(`X axis values: ${xticks}`)
    console.log(`Y axis values: ${yticks}`)
    
    // 8. Create the trace for the bar chart. 
    var barData = [{
      x: xticks,
      y: yticks,
      type: 'bar',
      orientation: 'h',
      mode: 'markers',
      marker: {size: 5}, 
      text: hoverText
    }];

    // 9. Create the layout for the bar chart.
    var barLayout = {
      title: "<b>Top Ten Bacteria Cultures Found</b>",
      xaxis: {title: "Sample Values" },
      yaxis: {title: "OTU IDs" },
      width: 450,
      height: 400, 
      font: {family: "Courier New", color: "steelblue"}
    };
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout)


    // 1. Create the trace for the bubble chart.
    var bubbleData = [{
      x: otuIds,
      y: sampleValues,
      text: otuLabels,
      mode: 'markers',
      marker:{ 
        size: sampleValues,
        color: otuIds,
        colorscale: "Earth"
      }
    }];

    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title:"Bacteria Cultures Per Sample",
      xaxis:{title: "OTU ID"},
      yaxis:{title: "Sample Values"},
      hovermode: "closest",
      paper_bgcolor: "aliceblue",
      plot_bgcolor: "aliceblue",
      font: {family: "Courier New", color: "black"}
    };

    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout)

    // 4. Create the trace for the gauge chart. 

    let filteredObj = data.metadata.filter(obj => obj.id == sample)[0]
    let washFrequency = parseFloat(filteredObj.wfreq)

    var gaugeData = [{
      type: "indicator",
      mode: "gauge+number",
      title: {text: "<b>Belly Button Washing Frequency</b><br>Scrubs per week"},
      value: washFrequency,
      gauge : {
        axis: {range: [null, 10], tickmode: "linear", tick0: 0, dtick: 2},
        bar: {color: "black"},
        steps: [
          {range: [0,2], color: "red"},
          {range: [2,4], color: "orange"},
          {range: [4,6], color: "yellow"},
          {range: [6,8], color: "greenyellow"},
          {range: [8,10], color: "green"},
        ]
      }

    }];
    
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = { 
      width: 400,
      height: 400,
      font: {family: "Courier New", color: "steelblue"},
    };

    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge", gaugeData, gaugeLayout)

  });
}
