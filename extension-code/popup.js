// import * as d3 from "d3";

// const { selectAll } = require("d3-selection");

// const { text } = require("d3-fetch");

// const { select, selectAll } = require("d3-selection");

// const { schemeBlues } = require("d3-scale-chromatic");

// document.addEventListener("DOMContentLoaded", () => {
//   alert("DOM ready!");
// });

// chrome.tabs.query(true, function(tab) {
//   chrome.runtime.sendMessage(tab.id, {method: "getText"}, function(response) {
//       if(response.method=="getText"){
//           alltext = response.data;
//           console.log("soemthin")
//       }
//   });
// });

// const getStorageData = key =>
//   new Promise((resolve, reject) =>
//     // chrome.storage.local.get(function(result){console.log(result)})
//     chrome.storage.sync.get(key, result => {
//       if(chrome.runtime.lastError){reject(Error(chrome.runtime.lastError.message))}
//       else{
//         if(result[key]){console.log(result[key])}
//         resolve(result)}}
//     )
//   )

function extractContent(html) {

  return new DOMParser().parseFromString(html, "text/html") . 
      documentElement . textContent;

}


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // console.log(sender.tab ?
    //             "from a content script:" + sender.tab.url :
    //             "from the extension");
    if (request.greeting != undefined){
      my_html = extractContent(request.greeting)
      // console.log(my_html)
      const Http = new XMLHttpRequest();
      const url2='http://localhost:5000/endpoint2/';
      Http.open("POST", url2, true);
      Http.setRequestHeader("Content-Type", "application/json");
      Http.setRequestHeader("Access-Control-Allow-Origin", "*");
      Http.send(JSON.stringify(my_html));
      Http.onreadystatechange = (e) => {
          var resp = Http.responseText
          console.log(resp)
      }
      sendResponse({farewell: "completed"});
    }
  }
);


  chrome.history.search({
    'text': '',              
    'maxResults': 100000000,
    'startTime': 0  
  },
  function(historyItems) {
    var jsonString = "{\"history\" : [";
    for (var i = 0; i < historyItems.length; ++i){
      var title = historyItems[i].title;
      title = title.replace(/"/g, '');
      var url = historyItems[i].url;
      var lastVisit = new Date(historyItems[i].lastVisitTime);
      var count = historyItems[i].visitCount;
      var arttext = "o";
      var addition = "{\"title\": \"" + title + "\", " + "\"url\": \"" + url + "\", " + "\"lastVisit\": \"" + lastVisit + "\", " + "\"count\": \"" + count + "\", " + "\"arttext\": \"" + arttext + "\"},"
      // var addition = "{\"title\": \"" + title + "\", " + "\"url\": \"" + url + "\", " + "\"lastVisit\": \"" + lastVisit + "\", " + "\"count\": \"" + count + "\"},"
      jsonString += addition
    }
    jsonString = jsonString.slice(0, -1)
    jsonString += "]}"

    var json = JSON.parse(jsonString)

    const Http = new XMLHttpRequest();
    const url2='http://localhost:5000/endpoint/';
    Http.open("POST", url2, true);
    Http.setRequestHeader("Content-Type", "application/json");
    Http.setRequestHeader("Access-Control-Allow-Origin", "*");
    Http.send(JSON.stringify(json));
    
    // ---------------------------------------------------------------------//   
    // code for visualization
    Http.onreadystatechange = (e) => {
      var data = Http.responseText
      var history = JSON.parse(data)
      console.log(history)
      if(Http.readyState == 4 && Http.status == 200){
        var red = '#db4444'
        var lightred = "#ff9a9a"
        var lightblue = '#96a4ff'
        var blue = '#424eed'
        var purple = '#be99e8'
        var left = 0 
        var urls = {}
        var left_list = []
        var left_urls = {}
        var c_left = 0 
        var c_left_list = []
        var c_left_urls = {}
        var center = 0
        var center_list = []
        var center_urls = {}
        var c_right = 0 
        var c_right_list = []
        var c_right_urls = {}
        var right = 0
        var right_list = []
        var right_urls = {}
        var fake = 0
        var fake_list = []
        var fake_urls = {}
        var domains = {}
        var mycolors = {}
        for (var i = 0; i < history["history"].length; i++) {
          if (history["history"][i]["domain"] in domains){
            domains[history["history"][i]["domain"]] = domains[history["history"][i]["domain"]] + 1
          }else{
            domains[history["history"][i]["domain"]] = 1
          }
          if (!(history["history"][i]["domain"] in mycolors)){
            mycolors[history["history"][i]["domain"]] = "lightgray"
          }
          if (history["history"][i]["mbfc_bias"] == "extremeleft" || history["history"][i]["mbfc_bias"] == "left" || history["history"][i]["allsides_bias"] == "Left"){
            left++
            left_list.push(history["history"][i]["title"])
            urls[history["history"][i]["title"]] = history["history"][i]["url"];
            mycolors[history["history"][i]["domain"]] = blue
          }else if (history["history"][i]["mbfc_bias"] == "extremeright" ||history["history"][i]["mbfc_bias"] == "right" || history["history"][i]["allsides_bias"] == "Right"){
            right++
            right_list.push(history["history"][i]["title"])
            // right_urls.push(history["history"][i]["url"])
            mycolors[history["history"][i]["domain"]] = red
            urls[history["history"][i]["title"]] = history["history"][i]["url"];
          } else if (history["history"][i]["mbfc_bias"] == "leftcenter" || history["history"][i]["allsides_bias"] == "LeanLeft"){
            c_left++
            c_left_list.push(history["history"][i]["title"])
            // c_left_urls.push(history["history"][i]["url"])
            mycolors[history["history"][i]["domain"]] = lightblue
            urls[history["history"][i]["title"]] = history["history"][i]["url"];
          }else if (history["history"][i]["mbfc_bias"] == "rightcenter" || history["history"][i]["allsides_bias"] == "LeanRight"){
            c_right++
            c_right_list.push(history["history"][i]["title"])
            // c_right_urls.push(history["history"][i]["url"])
            mycolors[history["history"][i]["domain"]] = lightred
            urls[history["history"][i]["title"]] = history["history"][i]["url"];
          }else if (history["history"][i]["mbfc_bias"] == "center" || history["history"][i]["allsides_bias"] == "Center"){
            center++
            center_list.push(history["history"][i]["title"])
            // center_urls.push(history["history"][i]["url"])
            mycolors[history["history"][i]["domain"]] = purple
            urls[history["history"][i]["title"]] = history["history"][i]["url"];
          }
          if (history["history"][i]["mbfc_fake"] != "none"){
            fake++
            fake_list.push(history["history"][i]["title"])
            // fake_urls.push(history["history"][i]["url"])
            urls[history["history"][i]["title"]] = history["history"][i]["url"];
          }
          if(mycolors[history["history"][i]["domain"]] == "lightgray"){
            if(history["history"][i]["classifier_bias"] == "['left']"){mycolors[history["history"][i]["domain"]] = blue}
            else if(history["history"][i]["classifier_bias"] == "['leftcenter']"){mycolors[history["history"][i]["domain"]] = lightblue}
            else if(history["history"][i]["classifier_bias"] == "['rightcenter']"){mycolors[history["history"][i]["domain"]] = lightred}
            else if(history["history"][i]["classifier_bias"] == "['center']"){mycolors[history["history"][i]["domain"]] = purple}
            else if(history["history"][i]["classifier_bias"] == "['right']"){mycolors[history["history"][i]["domain"]] = red}
          }
        }

        // ---------------------------------------------------------------------// 
        var all_sites = {"children" : []}
        function fill_domains(domains){
          for (const [key, value] of Object.entries(domains)) {
            all_sites.children.push({"Name": key, "Count": value})
          }
        }
        // ---------------------------------------------------------------------//   
        // data
        var total = left + right + center + c_left + c_right;
        var total_list = [left, right, center, c_left, c_right];
        var avg = (left + (-1)*right + c_left*(0.5) + c_right*(-0.5))/ total;
        var source_names = ["left", "left-center", "center", "right-center", "right"]
        var w = 500;
        var h = 500;
        var hpadding = 15;
        var barPadding = 1;
        var bump = 200;
        let x = d3.scaleBand().rangeRound([0, w]).padding(0.1);
        x.domain(source_names);
        var dataset = [ left_list, c_left_list, center_list, c_right_list, right_list ]
        var bars_down = false;
        // var red = 'red'
        // var lightred = "#ff9a9a"
        // var lightblue = '#96a4ff'
        // var blue = 'blue'
        // var purple = '#be99e8'


        // ---------------------------------------------------------------------//   
        // start of D3 components
          var svg = d3.select("body")
                .append("svg")
                .attr("width", w)
                .attr("height", h/3)
                .attr("class", "main");
    
          var defs = svg.append("defs");
          var gradient = defs.append("linearGradient")
            .attr("id", "svgGradient")
            .attr("x1", "100%")
            .attr("x2", "0%")
            .attr("y1", "100%")
            .attr("y2", "100%");

          gradient.selectAll("stop")
              .data([
                  {offset: "0%", color: red},
                  {offset: "25%", color: lightred},
                  {offset: "75%", color: lightblue},
                  {offset: "100%", color: blue}
                ])
              .enter().append("stop")
              .attr("offset", function(d) { return d.offset; })
              .attr("stop-color", function(d) { return d.color; });

          var y = d3.scaleLinear()
            .domain([d3.max(total_list), 0])
            .range([h,0]);
      
    

        // ---------------------------------------------------------------------//   
        // set_up()
        fill_domains(domains)
        make_title()
        make_grad_bar()
        make_bars()
        label_bars()
        make_bubbles()
        // console.log(all_sites)
        // console.log(mycolors)
        // ---------------------------------------------------------------------// 
        function revert(){
          d3.selectAll("table").remove();
          d3.select("svg.main").attr("height", h/3);
          svg.selectAll("text").remove();
          make_title()
          make_grad_bar()
          make_bars()
          label_bars()
          make_bubbles()
        } 
        // ---------------------------------------------------------------------// 
        function make_bars(){
          svg.selectAll("rect_bars")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("class", "rect_bars")
            .attr("id", function(d, i) {return 'bar_' + i})
            .attr("x", function(d, i) {
                return i * (w / dataset.length);
            })
            .attr("y", function(d) {
                // return h - (d.length * 4) - hpadding - bump;
                return 120
            })
            .attr("width", w / dataset.length - barPadding)
            .attr("height", function(d) {
                // return y(d.length);
                return 0
            })
            .attr("fill", function(d, i) {
              // return "rgb(0, 0, " + Math.round(d.length * 10) + ")";
              if(i==0){
                return blue;
              }else if(i==1){
                return lightblue;
              }else if (i==2){
                return purple
              }else if(i==3){
                return lightred;
              }else{
                return red;
              }
            })
            .on("click", function(d,i) {
              svg.selectAll("rect").remove();
              svg.selectAll("text").remove();
              svg.selectAll("circle").remove();
              d3.select("svg.bubble").remove();
              d3.select("svg.main").attr("height", 30);
              // d3.selectAll("table").remove();
              var id = d3.select(this).attr('id');
              show_tables(id);
              svg.append("text")
                .attr("x", 13)
                .attr("y", 28)
                // .attr("font-family", "sans-serif")
                .attr("fill", "grey")
                .attr("font-size", "8px")
                .attr("text-anchor", "left")
                .text("< back")
                .on("mouseover", function(d) {
                  d3.select(this).attr("font-weight", "bold");
                })                  
                .on("mouseout", function(d) {
                  d3.select(this).attr("font-weight", "normal");
                })
                .on("click", function() {
                  revert()
                });
              svg.append("text")
                .attr("id", "idk")
                .attr("x", 10)
                .attr("y", 15)
                .attr("font-weight", "bold")
                // .attr("font-family", "sans-serif")
                .attr("fill", "black")
                .attr("font-size", "20px")
                .attr("text-anchor", "left")
                .text(function() {
                  if(id=="bar_1"){
                    return "Left-Center: ";
                  }else if(id=="bar_0"){
                    return "Left: ";
                  }else if(id=="bar_2"){
                    return "Center: ";
                  }else if(id=="bar_3"){
                    return "Right-Center: ";
                  }else if(id=="bar_4"){
                    return "Right: ";
                  };
                  })
                .on("click", function() {
                  revert()
                });
              });
            }
              // tabulate('right', history['history'], ['title', 'mbfc_bias', 'allsides_bias', 'classifier_bias']); 
              // svg.selectAll("text.list")
              //   .data(function() {
              //     if(id=="bar_1"){
              //       return dataset[1];
              //     }else if(id=="bar_0"){
              //       return dataset[0];
              //     }else if(id=="bar_2"){
              //       return dataset[2];
              //     }else if(id=="bar_3"){
              //       return dataset[3];
              //     }else if(id=="bar_4"){
              //       return dataset[4];
              //     };})
              //   .enter()
              //   .append("text")
              //   .text(function(d) {
              //     return d;
              //   })
              //   .attr("text-anchor", "left")
              //   .attr("x", 50)
              //   .attr("y", function(d, i) {
              //     return (i*20) + 75;
              //   })
              //   .attr("font-family", "sans-serif")
              //   .attr("font-size", "11px")
              //   .attr("fill", "black")
              //   .on("mouseover", function(d) {
              //     d3.select(this).attr("text-decoration", "underline");
              //   })                  
              //   .on("mouseout", function(d) {
              //     d3.select(this).attr("text-decoration", "none");
              //   })
              //   .on("click", function(d, i){
              //     // console.log(i*1)
              //     // console.log(urls[i])
              //     window.open(
              //         urls[i],
              //         '_blank' // <- This is what makes it open in a new window.
              //     );
              //   });
            // });
            //end of BARS


        function show_tables(id){
          if(id=="bar_1"){
            tabulate('leftcenter', history['history'], ['title', 'mbfc_bias', 'allsides_bias', 'classifier_bias']); 
          }else if(id=="bar_0"){
            tabulate('left', history['history'], ['title', 'mbfc_bias', 'allsides_bias', 'classifier_bias']);
          }else if(id=="bar_2"){
            tabulate('center', history['history'], ['title', 'mbfc_bias', 'allsides_bias', 'classifier_bias']); 
          }else if(id=="bar_3"){
            tabulate('rightcenter', history['history'], ['title', 'mbfc_bias', 'allsides_bias', 'classifier_bias']); 
          }else if(id=="bar_4"){
            tabulate('right', history['history'], ['title', 'mbfc_bias', 'allsides_bias', 'classifier_bias']); 
          }
        }
        // ---------------------------------------------------------------------//   
          // gradient rectangle and yellow dot 
        function make_grad_bar(){
          svg.selectAll("gradient_rect")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("bars_down", false)
            .attr('x', 0)
            .attr('y', 100)
            .attr('width', 500)
            .attr('height',20)
            .attr('stroke', 'none')
            .attr("fill", "url(#svgGradient)")
            .on("click", function(d,i) {
                if (bars_down == false){
                  showBars();
                  bars_down = true
                }else{
                  hideBars();
                  bars_down = false
                }
            });

          svg.append("circle")
            .attr("cx", 250 - avg*250)
            .attr("cy", 110)
            .attr("r", 10)
            .style("fill", "yellow");
          }

        // ---------------------------------------------------------------------//   
        //title of viz
        function make_title(){
          svg.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .text("You viewed " + total + " news site pages.")
            // .attr("font-family", "sans-serif")
            .attr("font-weight", "bold")
            .attr("font-size", "16px")
            .attr("text-anchor", "left")
            .attr("fill", "grey");
          svg.append("text")
            .attr("x", 0)
            .attr("y", 15)
            .text("Here's your personalized breakdown: ")
            // .attr("font-family", "sans-serif")
            .attr("font-weight", "bold")
            .attr("font-size", "18px")
            .attr("text-anchor", "left")
            .attr("fill", "black");
          svg.append("text")
            .attr("x", 0)
            .attr("y", 83)
            .text("Overall bias: ")
            // .attr("font-family", "sans-serif")
            .attr("font-weight", "bold")
            .attr("font-size", "12px")
            .attr("text-anchor", "left")
            .attr("fill", "black");
        }


          //-----------------------------------------------------------------//
          function showBars(){
            d3.select("svg").transition().duration(1000).attr("height", h);
            svg.selectAll("rect.rect_bars")
              .data(dataset)
              .transition()
              .duration(1000)
              .attr("height", function(d,i){
                return y(d.length);
              }); 
          }
          function hideBars(){
            svg.selectAll("rect.rect_bars")
              .data(dataset)
              .transition()
              .duration(1000)
              .attr("height", 0); 
            d3.select("svg").transition().duration(1000).attr("height", h/3);
          }
        //-----------------------------------------------------------------//
        function tabulate(leaning, data, columns) {
          var table = d3.select('body').append('table')
          var thead = table.append('thead')
          var	tbody = table.append('tbody');
        
          // append the header row
          thead.append('tr')
            .selectAll('th')
            .data(columns).enter()
            .append('th')
              .text(function (column) { 
                if(column == 'mbfc_bias'){return 'MBFC'}
                else if(column == 'allsides_bias'){return 'Allsides'}
                else if(column == 'classifier_bias'){return 'Classifier'}
                else {return column; }
              });
        
          // create a row for each object in the data
          var rows = tbody.selectAll('tr')
            .data(data)
            .enter()
            .filter(function(d){
              if(leaning == 'left'){
                return (d['mbfc_bias'] == 'left' || d['allsides_bias'] == 'Left' 
                  || (d['mbfc_bias'] == 'none' && d['allsides_bias'] == 'none' && d['classifier_bias'] == "['left']"))
              }else if(leaning == 'leftcenter'){
                return (d['mbfc_bias'] == 'leftcenter' || d['allsides_bias'] == 'LeanLeft' 
                  || (d['mbfc_bias'] == 'none' && d['allsides_bias'] == 'none' && d['classifier_bias'] == "['leftcenter']"))
              }else if(leaning == 'rightcenter'){
                return (d['mbfc_bias'] == 'rightcenter' || d['allsides_bias'] == 'LeanRight' 
                  || (d['mbfc_bias'] == 'none' && d['allsides_bias'] == 'none' && d['classifier_bias'] == "['rightcenter']"))
              }else if(leaning == 'right'){
                return (d['mbfc_bias'] == 'right' || d['allsides_bias'] == 'Right' 
                  || (d['mbfc_bias'] == 'none' && d['allsides_bias'] == 'none' && d['classifier_bias'] == "['right']"))
              }else if(leaning == 'center'){
                return (d['mbfc_bias'] == 'center' || d['allsides_bias'] == 'Center' 
                  || (d['mbfc_bias'] == 'none' && d['allsides_bias'] == 'none' && d['classifier_bias'] == "['center']"))
              }
            })
            .append('tr');
        
          // create a cell in each row for each column
          var cells = rows.selectAll('td')
            .data(function (row) {
              return columns.map(function (column) {
                return {column: column, value: row[column]};
              });
            })
            .enter()
            .append('td')
              .text(function (d) { 
                // return d.value; 
                if(d.column != 'title'){
                  return '\u2605';
                }else{
                  return d.value;
                }
              })
              .style('color', function(d){
                  if(d.value == 'none' || d.value == 'Mixed'){return 'lightgray'}
                  else if(d.value == 'left'|| d.value == 'extremeleft' || d.value == 'Left' || d.value == "['left']"){return blue}
                  else if(d.value == 'leftcenter' || d.value == 'LeanLeft' || d.value == "['leftcenter']"){return lightblue}
                  else if(d.value == 'center' || d.value == 'Center' || d.value == "['center']"){return purple}
                  else if(d.value == 'rightcenter' || d.value == 'LeanRight' || d.value == "['rightcenter']"){return lightred}
                  else if(d.value == 'right' || d.value == 'extremeright'|| d.value == 'Right' || d.value == "['right']"){return red}
                  else{console.log(d.value)}
              });
        
          return table;
        }
        
        // render the tables
        // tabulate('left', history['history'], ['title', 'mbfc_bias', 'allsides_bias', 'classifier_bias']); // 2 column table

        //-----------------------------------------------------------------//
        function label_bars(){
          svg.selectAll("text.num")
            .attr("id", "num")
            .data(dataset)
            .enter()
            .append("text")
            .text(function(d) {
                return d.length;
            })
            .attr("text-anchor", "middle")
            .attr("x", function(d, i) {
                return i * (w / dataset.length) + (w / dataset.length - barPadding) / 2;
            })
            .attr("y", function(d) {
                return 140
            })
            // .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "white");
          }
          //-----------------------------------------------------------------//
          //BUBBLE CHART //
        function make_bubbles(){
          var diameter = 500;

          var bubble = d3.pack(all_sites)
              .size([diameter, diameter])
              .padding(1.5);

          var svg2 = d3.select("body")
              .append("svg")
              .attr("width", diameter)
              .attr("height", diameter)
              .attr("class", "bubble");
          
            svg2.append("text")
              .attr("x", 0)
              .attr("y", 17)
              .text("Visits per site: ")
              // .attr("font-family", "courier")
              .attr("font-weight", "bold")
              .attr("font-size", "12px")
              .attr("text-anchor", "left")
              .attr("fill", "black");

          var nodes = d3.hierarchy(all_sites)
              .sum(function(d) { return d.Count; });

          var node = svg2.selectAll(".node")
              .data(bubble(nodes).descendants())
              .enter()
              .filter(function(d){
                  return  !d.children
              })
              .append("g")
              .attr("class", "node")
              .attr("transform", function(d) {
                  return "translate(" + d.x + "," + d.y + ")";
              });

          node.append("title")
              .text(function(d) {
                  return d.Name + ": " + d.Count;
              });

          node.append("circle")
              .attr("r", function(d) {
                  return d.r;
              })
              .style("fill", function(d,i) {
                  return mycolors[d.data.Name];
              });

          node.append("text")
              .attr("dy", ".2em")
              .style("text-anchor", "middle")
              .text(function(d) {
                  return d.data.Name.substring(0, d.r / 3);
              })
              .attr("font-family", "sans-serif")
              .attr("font-size", function(d){
                  return d.r/5;
              })
              .attr("fill", "white");

          node.append("text")
              .attr("dy", "1.3em")
              .style("text-anchor", "middle")
              .text(function(d) {
                  return d.data.Count;
              })
              .attr("font-family",  "Gill Sans", "Gill Sans MT")
              .attr("font-size", function(d){
                  return d.r/5;
              })
              .attr("fill", "white");

          d3.select(self.frameElement)
              .style("height", diameter + "px");
        }


        //-----------------------------------------------------------------//

        // svg.selectAll("text.label")
        //     .attr("id", "label")
        //     .data(dataset)
        //     .enter()
        //     .append("text")
        //     .text(function(d,i) {
        //         return source_names[i];
        //     })
        //     .attr("text-anchor", "middle")
        //     .attr("x", function(d, i) {
        //         return i * (w / dataset.length) + (w / dataset.length - barPadding) / 2;
        //     })
        //     .attr("y", function(d) {
        //         // return h-5 - bump;
        //         return 100 + (d.length*4) + 10
        //     })
        //     .attr("font-family", "sans-serif")
        //     .attr("font-weight", "bold")
        //     .attr("font-size", "11px")
        //     .attr("fill", "black");
        // svg.append("text")
        //     .attr("x", 0)
        //     .attr("y", 50)
        //     .text("You viewed " + total + " news site pages.")
        //     .attr("font-family", "sans-serif")
        //     .attr("font-weight", "bold")
        //     .attr("font-size", "16px")
        //     .attr("text-anchor", "left")
        //     .attr("fill", "grey");
        //   svg.append("text")
        //     .attr("x", 0)
        //     .attr("y", 15)
        //     .text("Here's your personalized breakdown: ")
        //     .attr("font-family", "sans-serif")
        //     .attr("font-weight", "bold")
        //     .attr("font-size", "18px")
        //     .attr("text-anchor", "left")
        //     .attr("fill", "black");
        //   svg.append("text")
            // .attr("x", 0)
            // .attr("y", 40)
            // .text("Click on a bar to investigate that category further.")
            // .attr("font-family", "sans-serif")
            // .attr("font-size", "12px")
            // .attr("text-anchor", "left")
            // .attr("fill", "black");
          
          // ---------------------------------------------------------------------//   
          //disinformation box
          // svg.append("rect")
          //   .attr('x', 0)
          //   // .attr('y', 350)
          //   .attr("y", function(){
          //     var max = 0;
          //     for (var i = 0; i < dataset.length; i++) {
          //       if(dataset[i].length > max){ max = dataset[i].length }
          //     }
          //     return 100 + (max*4) + 30;
          //     // return 100
          //   })
          //   .attr('width', 400)
          //   .attr('height',50)
          //   .attr('stroke', 'black')
          //   .attr('fill', 'black')
          //   .on("click", function(d,i) {
          //     svg.selectAll("rect").remove();
          //     svg.selectAll("text").remove();
          //     svg.append("text")
          //       .attr("x", 43)
          //       .attr("y", 50)
          //       .attr("font-family", "sans-serif")
          //       .attr("fill", "grey")
          //       .attr("font-size", "8px")
          //       .attr("text-anchor", "left")
          //       .text("< back")
          //       .on("mouseover", function(d) {
          //         d3.select(this).attr("font-weight", "bold");
          //       })                  
          //       .on("mouseout", function(d) {
          //         d3.select(this).attr("font-weight", "normal");
          //       })
          //       .on("click", function() {
          //         revert()
          //       });
          //     svg.append("text")
          //       .attr("id", "idk")
          //       .attr("x", 40)
          //       .attr("y", 40)
          //       .attr("font-weight", "bold")
          //       .attr("font-family", "sans-serif")
          //       .attr("fill", "black")
          //       .attr("font-size", "14px")
          //       .attr("text-anchor", "left")
          //       .text("Potential Disinformation: ")
          //       .on("click", function() {
          //         revert()
          //       });
          //     svg.selectAll("text.list")
          //       .data(fake_list)
          //       .enter()
          //       .append("text")
          //       .text(function(d) {
          //         return d;
          //       })
          //       .attr("text-anchor", "left")
          //       .attr("x", 50)
          //       .attr("y", function(d, i) {
          //         return (i*20) + 75;
          //       })
          //       .attr("font-family", "sans-serif")
          //       .attr("font-size", "11px")
          //       .attr("fill", "black")
          //       .on("mouseover", function(d) {
          //         d3.select(this).attr("text-decoration", "underline");
          //       })                  
          //       .on("mouseout", function(d) {
          //         d3.select(this).attr("text-decoration", "none");
          //       })
          //       .on("click", function(d, i){
          //         // console.log(i*1)
          //         // console.log(urls[i])
          //         window.open(
          //             urls[i],
          //             '_blank' // <- This is what makes it open in a new window.
          //         );
          //       });
          //     });
          // svg.append("text")
          //   .attr("x", 3)
          //   .attr("y", function(){
          //     var max = 0;
          //     for (var i = 0; i < dataset.length; i++) {
          //       if(dataset[i].length > max){ max = dataset[i].length }
          //     }
          //     return 100 + (max*4) + 45;
          //   })
          //   .text("Potential Disinformation >")
          //   .attr("font-family", "sans-serif")
          //   // .attr("font-weight", "bold")
          //   .attr("font-size", "14px")
          //   .attr("text-anchor", "left")
          //   .attr("fill", "white");
          // svg.append("text")
          //   .attr("x", 3)
          //   // .attr("y", 378)
          //   .attr("y", function(){
          //     var max = 0;
          //     for (var i = 0; i < dataset.length; i++) {
          //       if(dataset[i].length > max){ max = dataset[i].length }
          //     }
          //     return 100 + (max*4) + 60;
          //   })
          //   .text(" You also viewed " + fake + " sites potentially containing disinformation.") 
          //   .attr("font-family", "sans-serif")
          //   // .attr("font-weight", "bold")
          //   .attr("font-size", "12px")
          //   .attr("text-anchor", "left")
          //   .attr("fill", "white");



// ---------------------------------------------------------------------//   
// ---------------------------------------------------------------------//            
// THIS IS THE REVERT FUNCTION ITS BASICALLY JUST A COPY OF THE ABOVE
  //       function revert(){
  //         svg.selectAll("text").remove();
  //         bar = svg.selectAll("rect")
  //         .data(dataset)
  //         .enter()
  //         .append("rect")
  //         .attr("id", function(d, i) {return 'bar_' + i})
  //         .attr("x", function(d, i) {
  //             return i * (w / dataset.length);
  //         })
  //         .attr("y", function(d) {
  //             return h - (d.length * 4) - hpadding - bump;
  //         })
  //         .attr("width", w / dataset.length - barPadding)
  //         .attr("height", function(d) {
  //             return d.length * 4;
  //         })
  //         .attr("fill", function(d, i) {
  //           // return "rgb(0, 0, " + Math.round(d.length * 10) + ")";
  //           if(i==0){
  //             return "blue";
  //           }else if(i==1){
  //             return "#adcae6";
  //           }else if (i==2){
  //             return "#c0c0c0";
  //           }else if(i==3){
  //             return "#ff9a9a";
  //           }else{
  //             return "red";
  //           }
  //         })
  //         .on("click", function(d,i) {
  //           svg.selectAll("rect").remove();
  //           svg.selectAll("text").remove();
  //           var id = d3.select(this).attr('id');
  //           svg.append("text")
  //             .attr("x", 43)
  //             .attr("y", 50)
  //             .attr("font-family", "sans-serif")
  //             .attr("fill", "grey")
  //             .attr("font-size", "8px")
  //             .attr("text-anchor", "left")
  //             .text("< back")
  //             .on("mouseover", function(d) {
  //               d3.select(this).attr("font-weight", "bold");
  //             })                  
  //             .on("mouseout", function(d) {
  //               d3.select(this).attr("font-weight", "normal");
  //             })
  //             .on("click", function() {
  //               revert()
  //             });
  //           svg.append("text")
  //             .attr("id", "idk")
  //             .attr("x", 40)
  //             .attr("y", 40)
  //             .attr("font-weight", "bold")
  //             .attr("font-family", "sans-serif")
  //             .attr("fill", "black")
  //             .attr("font-size", "14px")
  //             .attr("text-anchor", "left")
  //             .text(function() {
  //               if(id=="bar_1"){
  //                 return "Left-Center: ";
  //               }else if(id=="bar_0"){
  //                 return "Left: ";
  //               }else if(id=="bar_2"){
  //                 return "Center: ";
  //               }else if(id=="bar_3"){
  //                 return "Right-Center: ";
  //               }else if(id=="bar_4"){
  //                 return "Right: ";
  //               };
  //               })
  //             .on("click", function() {
  //               revert()
  //             });
  //           svg.selectAll("text.list")
  //             .data(function() {
  //               if(id=="bar_1"){
  //                 return dataset[1];
  //               }else if(id=="bar_0"){
  //                 return dataset[0];
  //               }else if(id=="bar_2"){
  //                 return dataset[2];
  //               }else if(id=="bar_3"){
  //                 return dataset[3];
  //               }else if(id=="bar_4"){
  //                 return dataset[4];
  //               };})
  //             .enter()
  //             .append("text")
  //             .text(function(d) {
  //               return d;
  //             })
  //             .attr("text-anchor", "left")
  //             .attr("x", 50)
  //             .attr("y", function(d, i) {
  //               // return h - (i*20) - 70;
  //               return (i*20) + 75;
  //             })
  //             .attr("font-family", "sans-serif")
  //             .attr("font-size", "11px")
  //             .attr("fill", "black")
  //             .on("mouseover", function(d) {
  //               d3.select(this).attr("text-decoration", "underline");
  //             })                  
  //             .on("mouseout", function(d) {
  //               d3.select(this).attr("text-decoration", "none");
  //             })
  //             .on("click", function(d, i){
  //               // console.log(i*1)
  //               // console.log(urls[i])
  //               window.open(
  //                   urls[i],
  //                   '_blank' // <- This is what makes it open in a new window.
  //               );
  //             });

  //         });

  //         svg.selectAll("text.num")
  //         .attr("id", "num")
  //         .data(dataset)
  //         .enter()
  //         .append("text")
  //         .text(function(d) {
  //             return d.length;
  //         })
  //         .attr("text-anchor", "middle")
  //         .attr("x", function(d, i) {
  //             return i * (w / dataset.length) + (w / dataset.length - barPadding) / 2;
  //         })
  //         .attr("y", function(d) {
  //             return h - (d.length * 4) + 14 - hpadding - bump;
  //         })
  //         .attr("font-family", "sans-serif")
  //         .attr("font-size", "11px")
  //         .attr("fill", "white");

  //     svg.selectAll("text.label")
  //         .attr("id", "label")
  //         .data(dataset)
  //         .enter()
  //         .append("text")
  //         .text(function(d,i) {
  //             return source_names[i];
  //         })
  //         .attr("text-anchor", "middle")
  //         .attr("x", function(d, i) {
  //             return i * (w / dataset.length) + (w / dataset.length - barPadding) / 2;
  //         })
  //         .attr("y", function(d) {
  //             return h-5 - bump;
  //         })
  //         .attr("font-family", "sans-serif")
  //         .attr("font-weight", "bold")
  //         .attr("font-size", "11px")
  //         .attr("fill", "black");
  //     svg.append("text")
  //         .attr("x", 0)
  //         .attr("y", 160)
  //         .text("You viewed " + total + " news site pages.")
  //         .attr("font-family", "sans-serif")
  //         .attr("font-weight", "bold")
  //         .attr("font-size", "16px")
  //         .attr("text-anchor", "left")
  //         .attr("fill", "grey");
  //       svg.append("text")
  //         .attr("x", 0)
  //         .attr("y", 75)
  //         .text("Here's your personalized breakdown: ")
  //         .attr("font-family", "sans-serif")
  //         .attr("font-weight", "bold")
  //         .attr("font-size", "18px")
  //         .attr("text-anchor", "left")
  //         .attr("fill", "black");
  //       svg.append("text")
  //         .attr("x", 0)
  //         .attr("y", 95)
  //         .text("Click on a bar to investigate that category further.")
  //         .attr("font-family", "sans-serif")
  //         // .attr("font-weight", "bold")
  //         .attr("font-size", "12px")
  //         .attr("text-anchor", "left")
  //         .attr("fill", "black");
        
  //         svg.append("rect")
  //         .attr('x', 0)
  //         .attr('y', 350)
  //         .attr('width', 400)
  //         .attr('height',50)
  //         .attr('stroke', 'black')
  //         .attr('fill', 'black')
  //         .on("click", function(d,i) {
  //           svg.selectAll("rect").remove();
  //           svg.selectAll("text").remove();
  //           svg.append("text")
  //             .attr("x", 43)
  //             .attr("y", 50)
  //             .attr("font-family", "sans-serif")
  //             .attr("fill", "grey")
  //             .attr("font-size", "8px")
  //             .attr("text-anchor", "left")
  //             .text("< back")
  //             .on("mouseover", function(d) {
  //               d3.select(this).attr("font-weight", "bold");
  //             })                  
  //             .on("mouseout", function(d) {
  //               d3.select(this).attr("font-weight", "normal");
  //             })
  //             .on("click", function() {
  //               revert()
  //             });
  //           svg.append("text")
  //             .attr("id", "idk")
  //             .attr("x", 40)
  //             .attr("y", 40)
  //             .attr("font-weight", "bold")
  //             .attr("font-family", "sans-serif")
  //             .attr("fill", "black")
  //             .attr("font-size", "14px")
  //             .attr("text-anchor", "left")
  //             .text("Potential Disinformation: ")
  //             .on("click", function() {
  //               revert()
  //             });
  //           svg.selectAll("text.list")
  //             .data(fake_list)
  //             .enter()
  //             .append("text")
  //             .text(function(d) {
  //               return d;
  //             })
  //             .attr("text-anchor", "left")
  //             .attr("x", 50)
  //             .attr("y", function(d, i) {
  //               return (i*20) + 75;
  //             })
  //             .attr("font-family", "sans-serif")
  //             .attr("font-size", "11px")
  //             .attr("fill", "black")
  //             .on("mouseover", function(d) {
  //               d3.select(this).attr("text-decoration", "underline");
  //             })                  
  //             .on("mouseout", function(d) {
  //               d3.select(this).attr("text-decoration", "none");
  //             })
  //             .on("click", function(d, i){
  //               // console.log(i*1)
  //               // console.log(urls[i])
  //               window.open(
  //                   urls[i],
  //                   '_blank' // <- This is what makes it open in a new window.
  //               );
  //             });
  //           });
  //       svg.append("text")
  //         .attr("x", 3)
  //         .attr("y", 362)
  //         .text("Potential Disinformation >")
  //         .attr("font-family", "sans-serif")
  //         // .attr("font-weight", "bold")
  //         .attr("font-size", "14px")
  //         .attr("text-anchor", "left")
  //         .attr("fill", "white");
  //       svg.append("text")
  //         .attr("x", 3)
  //         .attr("y", 378)
  //         .text(" You also viewed " + fake + " sites potentially containing disinformation.") 
  //         .attr("font-family", "sans-serif")
  //         // .attr("font-weight", "bold")
  //         .attr("font-size", "12px")
  //         .attr("text-anchor", "left")
  //         .attr("fill", "white");
  //       }
            
  //       // var width = 90, height = 60;
  //       // var barPadding = 1;
  //       // var bodySelection = d3.select("body");

  //       // var svgSelection = bodySelection.append("svg")
  //       //       .attr("width", width)
  //       //       .attr("height", height);

  //       // var circleSelection = svgSelection.append("circle")
  //       //       .attr("cx", 25)
  //       //       .attr("cy", 25)
  //       //       .attr("r", 25)
  //       //       .style("fill", "purple");
  //       // data = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
  //       //   11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ];
  //       // svgSelection.selectAll("rect")
  //       //       .data(data)
  //       //       .enter()
  //       //       .append("rect")
  //       //       // .attr("class", "bar")
  //       //       .attr("x", function(d) {
  //       //         return i * (width / data.length);
  //       //       })
  //       //       .attr("y", function(d) { return 0; })
  //       //       .attr("width", width / data.length - barPadding)
  //       //       .attr("height", function(d) { return height - 10; });
        
  //       // svg.selectAll("rect")
  //       //       .data(dataset)
  //       //       .enter()
  //       //       .append("rect")
  //       //       .attr("x", function(d, i) {
  //       //           return i * (w / dataset.length);
  //       //       })
  //       //       .attr("y", 0)
  //       //       .attr("width", w / dataset.length - barPadding)
  //       //       .attr("height", 100);
      }
    }

  });
          

