// Global function called when select element is changed
function onCategoryChanged() {
    var select = d3.select('#categorySelect').node();
    // Get current value of select element
    var category = select.options[select.selectedIndex].value;
    // Update chart with the selected category of temperatures
    updateChart(category);
}

// This function converts strings to numeric temperatures during data preprocessing
function dataPreprocessor(row) {
    return {
        country: row.Country,
        continent: row.Continent,
        house2015: +row.house2015, 
        house2022: +row.house2022 
    };
}

var svg = d3.select('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 60, r: 40, b: 30, l: 120};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

// Compute the spacing for bar bands based on the number of countries (20 in this case)
var barBand = chartHeight / 20;
var barHeight = barBand * 0.7;

var countries;

var widthScale = d3.scaleLinear()
    .range([0, chartWidth])

d3.csv('housing_cost.csv', dataPreprocessor).then(function(dataset) {
    // Create global variables here and initialize the chart

    countries = dataset
    widthScale.domain([0, d3.max(countries, function(d) {
        return Math.max(d.house2015, d.house2022);
    })]);

    // **** Your JavaScript code goes here ****
    svg.append('text')
        .attr('class', 'title')  
        .attr('x', 100) 
        .attr('y', 30)           
        .attr('text-anchor', 'middle')  
        .text('Housing Burden (%)');

    var xAxisBottom = d3.axisBottom(widthScale)
     

    chartG.append('g')
        .attr('class', 'x-axis-bottom')
        .attr('transform', `translate(0, ${chartHeight})`) 
        .call(xAxisBottom);

        // Create a left vertical axis using widthScale
    var yAxisLeft = d3.axisLeft(widthScale)
    .ticks(5) // 원하는 만큼의 틱 개수 설정
    .tickFormat(d => d + '%'); // 값에 포맷 추가 (예: % 기호)

    // Append the left vertical axis to the chart
    chartG.append('g')
    .attr('class', 'y-axis-left')
    .attr('transform', `translate(0, 0)`) // 왼쪽에 축 위치
    .call(yAxisLeft);


    // Update the chart for all countries to initialize
    updateChart('all-continents');
});
var currentFilterKey = 'all-continents'; 

function updateChart(filterKey, cutoff = 0) {
    // Create a filtered array of countries based on the filterKey
    var filteredCountries;
    currentFilterKey = filterKey;

    if (filterKey === 'all-continents') {
        filteredCountries = countries.filter(d => d.house2022 >= cutoff && d.house2015 >= cutoff);
    } else {
        filteredCountries = countries.filter(d => d.continent === filterKey && d.house2022 >= cutoff && d.house2015 >= cutoff);
    }

    // Bar width adjustment for two bars per country
    var barSpacing = barBand * 0.2; // Spacing between bars
    var individualBarWidth = (barBand - barSpacing) / 2;

    // Bars for house2022
    var bars2022 = chartG.selectAll('.bar2022')
        .data(filteredCountries, d => d.country);

    var bars2022Enter = bars2022.enter()
        .append('rect')
        .attr('class', 'bar2022')
        .attr('x', (d, i) => i * barBand) // 가로 방향으로 나열
        .attr('y', chartHeight) // 초기 위치
        .attr('width', individualBarWidth) // 두께 조정
        .attr('height', 0) // 초기 높이
        .attr('fill', 'darkblue');

    bars2022Enter.merge(bars2022)
        .transition()
        .duration(500)
        .attr('x', (d, i) => i * barBand) // 바 위치
        .attr('y', d => chartHeight - widthScale(d.house2022)) // 높이에 따라 위치 변경
        .attr('height', d => widthScale(d.house2022)) // 값에 따라 바의 길이 설정
        .attr('width', individualBarWidth); // 바 두께 유지

    bars2022.exit().remove();

    // Bars for house2015
    var bars2015 = chartG.selectAll('.bar2015')
        .data(filteredCountries, d => d.country);

    var bars2015Enter = bars2015.enter()
        .append('rect')
        .attr('class', 'bar2015')
        .attr('x', (d, i) => i * barBand + individualBarWidth + barSpacing) // 두 번째 바의 위치
        .attr('y', chartHeight) // 초기 위치
        .attr('width', individualBarWidth) // 두께 조정
        .attr('height', 0) // 초기 높이
        .attr('fill', 'purple');

    bars2015Enter.merge(bars2015)
        .transition()
        .duration(500)
        .attr('x', (d, i) => i * barBand + individualBarWidth + barSpacing) // 바 위치
        .attr('y', d => chartHeight - widthScale(d.house2015)) // 높이에 따라 위치 변경
        .attr('height', d => widthScale(d.house2015)) // 값에 따라 바의 길이 설정
        .attr('width', individualBarWidth); // 바 두께 유지

    bars2015.exit().remove();

    // Handle the text labels for each country
    var labels = chartG.selectAll('.label')
        .data(filteredCountries, d => d.country);

    var labelsEnter = labels.enter()
        .append('text')
        .attr('class', 'label')
        .attr('text-anchor', 'middle')
        .attr('x', (d, i) => i * barBand + barBand / 2) // 두 바의 가운데 위치
        .attr('y', chartHeight + 15) // 바 아래에 레이블 표시
        .text(d => d.country);

    labelsEnter.merge(labels)
        .transition()
        .duration(500)
        .attr('x', (d, i) => i * barBand + barBand / 2) // 두 바의 가운데 위치
        .attr('y', chartHeight + 15); // 세로 위치 유지

    labels.exit().remove();
}



// Remember code outside of the data callback function will run before the data loads
d3.select('#main')
    .append('p')
    .append('button')
    .style("border", "1px solid black")
    .text('Filter Data')
    .on('click', function() {
        // Add code here
        var cutoffValue = parseFloat(d3.select('#cutoff').property('value'));
        updateChart(currentFilterKey, cutoffValue);
    });