import React from 'react'
import ReactDOM from 'react-dom'
import isEqual from 'lodash/isEqual'
import CountryPivot from './country_pivot'
import SSF from "ssf";

const baseOptions = {
  font_size_main: {
    label: "Font Sizes",
    type: 'string',
    section: 'Style',
    default: "",
    order: 4,
    display_size: 'normal'
  },
  orientation: {
    label: "Orientation",
    type: 'string',
    section: 'Style',
    display: 'select',
    values: [
      {'Auto': 'auto'},
      {'Vertical': 'vertical'},
      {'Horizontal': 'horizontal'}
    ],
    default: 'auto',
    order: 3,
    display_size: 'normal'
  },
  header_background : {
    type: `string`,
    label: `Header Background`,
    display: `color`,
    default: '#FFFFFF',
    section: 'Style',
    order: 2
  },

  subtext_color : {
    type: `string`,
    label: `Subtext Color`,
    display: `color`,
    default: '#6B6B6B',
    section: 'Style',
    order: 1
  }
}

let currentOptions = {}
let currentConfig = {}

looker.plugins.visualizations.add({
  id: "country_pivot",
    label: "Country Pivot",
    options: baseOptions,
  create: function(element, config) {
    this.chart = ReactDOM.render(
      <CountryPivot
        config={{}}
        data={[]}
      />,
      element
    );

  },
  updateAsync: function(data, element, config, queryResponse, details, done) {

    this.clearErrors();

    const measures = [].concat(
      queryResponse.fields.dimensions,
      queryResponse.fields.measures,
      queryResponse.fields.table_calculations
    )

    if (measures.length == 0) {
      this.addError({title: "No Measures", message: "This chart requires measures"});
      return;
    }

    if (measures.length > 10) {
      this.addError({title: "Maximum number of data points", message: "This visualization does not allow more than 10 data points to be selected"});
      return;
    }

    if (queryResponse.pivots.length > 0) {

    }

    console.log(data)
    var dataPoints = data.reduce((acc, curr) =>{
        Object.keys(curr).forEach(label => 
        {     
          Object.keys(curr[label]).forEach(valItem => 
          {      
           if(typeof(curr[label][valItem]) == "object"){
            console.log(valItem)
            acc[valItem] = acc[valItem] || {}
            acc[valItem].links = acc[valItem].links || curr[label][valItem].links
            acc[valItem][label] = (acc[valItem][label] || 0) + curr[label][valItem].value *1}})
        
          })
        return acc},{}
        )
    
    dataPoints = Object.keys(dataPoints).map(item => {console.log(item);return ([item].concat(Object.values(dataPoints[item])))}).sort(function(a,b){ return b[2] - a[2]}).slice(0,4)
    console.log(dataPoints)
        
    
    const options = Object.assign({}, baseOptions)

    
  
    if (
      !isEqual(currentOptions, options) ||
      !isEqual(currentConfig, config)
    ) {
      this.trigger('registerOptions', options)
      currentOptions = Object.assign({}, options)
      currentConfig = Object.assign({}, config)
    }

    this.chart = ReactDOM.render(
      <CountryPivot
        config={config}
        data={dataPoints}
      />,
      element
    );
    done()
  }
});
