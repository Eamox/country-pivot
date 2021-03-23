import React, { PureComponent, useState } from "react";
import styled from 'styled-components'
import PropTypes from 'prop-types'
// @ts-ignore
import {formatType, lighten} from '../common'
import SSF from "ssf";

const ComparisonDataPointGroup = styled.div`
  flex: 1;
  width: 100%;
  margin: 10px 0;
  color: ${props => props.color};
  font-weight: 100;
  font-size: 12px;


  a.drillable-link {
    color: #a5a6a1;
    text-decoration: none;
  }
`

const MyMark = styled.mark `
color:${props => props.color}
background: inherit`

const ComparisonPercentageChange = styled.div`
  display: inline-block;
  padding-right: 5px;

  align-items:center;
  :hover {
    text-decoration: underline;
  }
`
const ComparisonSimpleValue = styled.div`
  font-weight: 100;
  display: inline-block;
  padding-right: 5px;
  :hover {
    text-decoration: underline;
  }
`


export const ComparisonDataPoint: React.FC<{
  config: any,
  compDataPoint: any,
  dataPoint: any,
  percChange: number,
  progressPerc: number,
  handleClick: (i: any, j: any)=>{},
}> = ({ config, compDataPoint, dataPoint, percChange, progressPerc, handleClick }) => {

  function tryFormatting(formatString: string, value: number, defaultString: string) {
    try {
      return SSF.format(formatString, value)
    }
    catch(err) {
      return defaultString
    }
  }
  compDataPoint.label =  config[`comparison_label_${compDataPoint.name}`] || compDataPoint.label
  const pos = config[`pos_is_bad_${compDataPoint.name}`]
  return (
    <ComparisonDataPointGroup color = {config['subtext_color']}>
      <ComparisonPercentageChange data-value={percChange} onClick={() => { handleClick(compDataPoint, event) }}>
     {/* {config[`title_overrride_${dataPoint.name}`] || dataPoint.label} */}
     <MyMark color={(percChange * (pos * 2 - 1) ) > 0 ? 'red' : 'green'}>{
    [( Math.abs(percChange) < 0.5) ? "■" : (percChange > 0 ? "▲": "▼"),Math.abs(percChange)]}% </MyMark>
    {compDataPoint.label}
      </ComparisonPercentageChange>
  

    {config[`comparison_style_${compDataPoint.name}`] !== 'value' ? null : 
    <ComparisonSimpleValue onClick={() => { handleClick(compDataPoint, event) }}>
    {config[`comp_value_format_${compDataPoint.name}`] === "" ? compDataPoint.formattedValue : tryFormatting(config[`comp_value_format_${compDataPoint.name}`], compDataPoint.value, compDataPoint.formattedValue)}
    </ComparisonSimpleValue>}

    </ComparisonDataPointGroup>
  )
}
