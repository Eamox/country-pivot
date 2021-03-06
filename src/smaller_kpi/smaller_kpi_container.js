import React from 'react'
import ReactDOM from 'react-dom'
import isEqual from 'lodash/isEqual'
import MultipleValue from './smaller_kpi'
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
  id: "smaller_kpi",
    label: "Smaller Kpi",
    options: baseOptions,
  create: function(element, config) {
    this.chart = ReactDOM.render(
      <MultipleValue
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

    let firstRow = data[0];
    console.log(data)
    const dataPoints = measures.map(measure => {
      var point_value =  data.reduce((acc, curr) =>{return acc + curr[measure.name].value*1 },0)
      return ({
        name: measure.name,
        label: measure.label_short || measure.label,
        value: point_value,
        link: firstRow[measure.name].links,
        valueFormat: config[`value_format`],
        formattedValue: config[`value_format_${measure.name}`] === "" || config[`value_format_${measure.name}`] === undefined ? LookerCharts.Utils.textForCell(firstRow[measure.name]) : SSF.format(config[`value_format_${measure.name}`], point_value)
      })
    });

    const options = Object.assign({}, baseOptions)
    
    dataPoints.forEach((dataPoint, index) => {
      //Style -- apply to all
      if (index < 1) {
        options[`show_title_${dataPoint.name}`] = {
          type: 'boolean',
          label: `${dataPoint.label} - Show Title`,
          default: true,
          section: 'Style',
          order: 10 * index + 2,
        }
        options[`comparison_direction_${dataPoint.name}`] = {
          type: 'string',
          label: `${dataPoint.label} - Comparison Direction`,
          section: 'Style',
          display: 'select',
          values: [
            {'Below': 'below'},
            {'Above': 'above'},
            {'Left': 'left'},
            {'Right': 'right'},
          ],
          default: 'below',
          order: 10 * index + 3,
        }

        options[`title_overrride_${dataPoint.name}`] = {
          type: 'string',
          label: `${dataPoint.label} - Title`,
          section: 'Style',
          placeholder: dataPoint.label,
          order: 10 * index + 4,
        }
        options[`title_placement_${dataPoint.name}`] = {
          type: 'string',
          label: `${dataPoint.label} - Title Placement`,
          section: 'Style',
          display: 'select',
          values: [
            {'Above number': 'above'},
            {'Below number': 'below'},
          ],
          default: 'above',
          order: 10 * index + 5,
        }
        options[`value_format_${dataPoint.name}`] = {
          type: 'string',
          label: `${dataPoint.label} - Value Format`,
          section: 'Style',
          default: "",
          order: 10 * index + 6
        }
      }
      // Comparison - all data points other than the first
      else {
          options[`comparison_style_${dataPoint.name}`] = {
            type: 'string',
            display: 'radio',
            label: `${dataPoint.label} - Style`,
            values: [
              {'Show as Value': 'value'},
              {'Show as Percentage Change': 'percentage_change'},
            ],
            section: 'Comparison',
            default: 'value',
            order: 10 * index + 1,
          }
          options[`comparison_show_label_${dataPoint.name}`] = {
            type: 'boolean',
            label: `${dataPoint.label} - Show Label`,
            section: 'Comparison',
            default: true,
            order: 10 * index + 3,
          }
          if (config[`comparison_style_${dataPoint.name}`] === "percentage_change") {
            options[`pos_is_bad_${dataPoint.name}`] = {
              type: 'boolean',
              label: `Positive Values are Bad`,
              section: 'Comparison',
              default: false,
              order: 10 * index + 2,
            }
          }
          if (config[`comparison_show_label_${dataPoint.name}`]) {
            options[`comparison_label_${dataPoint.name}`] = {
              type: 'string',
              label: `${dataPoint.label} - Label`,
              placeholder: dataPoint.label,
              section: 'Comparison',
              order: 10 * index + 4,
            }
            options[`comparison_label_placement_${dataPoint.name}`] = {
              type: 'string',
              label: `${dataPoint.label} - Label Placement`,
              display: 'select',
              values: [
                {'Above': 'above'},
                {'Below': 'below'},
                {'Left': 'left'},
                {'Right': 'right'},
              ],
              default: 'below',
              section: 'Comparison',
              order: 10 * index + 5,
            }
            if (config[`comparison_style_${dataPoint.name}`] === "value" ||
                config[`comparison_style_${dataPoint.name}`] === "calculate_progress_perc") {
              options[`comp_value_format_${dataPoint.name}`] = {
                type: 'string',
                label: `Comparison Value Format`,
                placeholder: "Spreadsheet-style format code",
                section: 'Comparison',
                default: "",
                order: 10 * index + 6
              }
            }
          }
        }
      }
    )
  
    if (
      !isEqual(currentOptions, options) ||
      !isEqual(currentConfig, config)
    ) {
      this.trigger('registerOptions', options)
      currentOptions = Object.assign({}, options)
      currentConfig = Object.assign({}, config)
    }

    let valuesToComparisonsMap = {}
    let lastDataPointIndex = -1
    const fullValues = dataPoints.filter((dataPoint, index) => {
      if (config[`show_comparison_${dataPoint.name}`] !== true) {
        lastDataPointIndex++
        return true
      } else {
        valuesToComparisonsMap[lastDataPointIndex] = index
      }
      return false
    }).map((fullValue, index) => {
      const comparisonIndex = valuesToComparisonsMap[index]
      if (comparisonIndex) {
        fullValue.comparison = dataPoints[comparisonIndex]
      }
      return fullValue;
    })
    console.log(fullValues)
    this.chart = ReactDOM.render(
      <MultipleValue
        config={config}
        data={fullValues}
      />,
      element
    );
    done()
  }
});
