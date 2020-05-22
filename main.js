//D3 Scripting part

//Fetch JSON Data
fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
    .then(res => res.json())
    .then(res => {
        const data = res;
        // Fetched array of object same as JSON 
        createSvg(data);
    })

//Create a function to create SVG
function createSvg(data) {
    //Define dataset as constant of data to work for.
    const dataset = data;
    // Extracted data format {baseTemperature: 8.66, monthlyVariance: Array(3153)}

    //Create other constants and arrays
    const baseTemperature = dataset.baseTemperature; // 8.66, Calculation requires rounding    

    const monthlyVariance = dataset.monthlyVariance.map(d => ({
        ...d,
        temp: baseTemperature - d.variance
    }));
    //It is array of object of format [{year: 1753, month: 1, variance: -1.366, temp: 10.026}, ...] with length 3153

    //Create and arry of year from Json
    const yearsArr = monthlyVariance.map((d, i) => monthlyVariance[i].year);
    var yearFormat = d3.format("d");

    const tempArr = monthlyVariance.map((d, i) => monthlyVariance[i].temp);

    // Color Scheme same as color scale choosen of SchemeTableau10
    const colorScheme = ["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab"];
    
    //Color Scale
    const colorScale = d3.scaleQuantize().domain([d3.min(tempArr), d3.max(tempArr)]).range(colorScheme);
    
    

    //Defining months
    const Months = {
        1: 'January',
        2: 'February',
        3: 'March',
        4: 'April',
        5: 'May',
        6: 'June',
        7: 'July',
        8: 'August',
        9: 'September',
        10: 'October',
        11: 'November',
        12: 'December'
    };


    // Create an SVG with height, width and padding property
    const width = 1350;
    const height = 500;

    //Padding 
    const padding = {
        top: 20,
        right: 50,
        bottom: 50,
        left: 70
    };

    //Actual bar chart area inside SVG element
    const chartArea = {
        'width': width - padding.left - padding.right,
        'height': height - padding.top - padding.bottom
    };

    //SVG creation
    const svg = d3.select('#container').append('svg')
        .attr('width', width)
        .attr('height', height);


    //Y-Scale
    const yScale = d3.scaleBand()
        .domain(monthlyVariance.map(d => d.month))
        .range([0, chartArea.height]);

    //X-Scale
    const xScale = d3.scaleTime()
        .domain([d3.min(yearsArr), d3.max(yearsArr)])
        .range([0, chartArea.width]);

    //Y-Axis
    const yAxis = svg.append('g')
        .classed('y-axis', true)
        .attr('id', 'y-axis')
        .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
        .call(d3.axisLeft(yScale).tickFormat(month => Months[month]));

    //X-Axis
    const xAxis = svg.append('g')
        .classed('x-axis', true)
        .attr('id', 'x-axis')
        .attr('transform', 'translate(' + padding.left + ',' + (chartArea.height + padding.top) + ')')
        .call(d3.axisBottom(xScale).tickFormat(yearFormat));

    //Legends Y-Axis
    svg.append('text')
        .attr('id', 'text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -(height / 2 + 20))
        .attr('y', 20)
        .text('Month');

    //Legends X-Axis
    svg.append('text')
        .attr('id', 'text')
        .attr('transform', 0)
        .attr('x', width / 2 - 5)
        .attr('y', height - 10)
        .text('Year');

    //Manipulate data to create rect bars
    svg.selectAll('rect')
        .data(monthlyVariance)
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('data-month', d => d.month - 1)
        .attr('data-year', d => d.year)
        .attr('data-temp', d => d.temp)
        .attr('fill', d => colorScale(Math.round(d.temp)))
        .attr('x', (d, i) => padding.left + xScale(d.year))
        .attr('y', (d, i) => padding.top + yScale(d.month))
        .attr('width', chartArea.width / Math.floor(monthlyVariance.length / 12))
        .attr('height', (d, i) => Math.ceil(chartArea.height / 12))
        .on('mouseover', (d, i) => {
            tooltip.classList.add('show');

            tooltip.style.left = xScale(d.year) + (padding.left + 20) + 'px';
            tooltip.style.top = yScale(d.month) + 'px';
            tooltip.setAttribute('data-year', d.year)

            tooltip.innerHTML = `
              ${d.year} : ${d.month} <br>
              Temp : ${d.temp.toFixed(1)}<br>
              ${d.variance}
            `;
        })
        .on('mouseout', () => {
            tooltip.classList.remove('show');
        });

    //Legend with temperature color information

    const legendWidth = 400;
    const legendHeight = 30;


    const legendRectWidth = legendWidth / 10;

    const legend = d3.select('#container')
        .append('svg')
        .attr('id', 'legend')
        .attr('class', 'legend')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .selectAll('rect')
        .data(colorScheme)
        .enter()
        .append('rect')
        .attr('x', (_, i) => i * legendRectWidth)
        .attr('y', 0)
        .attr('width', legendRectWidth)
        .attr('height', legendHeight)
        .attr('fill', d => d)
}