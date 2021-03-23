import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {formatType, lighten} from '../common'
import { ComparisonDataPoint } from './ComparisonDataPoint'

const DataPointsWrapper = styled.div`
  font-family: "Open Sans", "Noto Sans JP", "Noto Sans", "Noto Sans CJK KR", Helvetica, Arial, sans-serif;
  display: flex;
  flex-direction: ${props => props.layout === 'horizontal' ? 'row' : 'column'};
  align-items: center;
  height: 100%;
  border-left: 5px solid ${props => props.headerBackground};
  border-radius: 4px;
`

const dataPointGroupDirectionDict = {
  'below': 'column',
  'above': 'column-reverse',
  'left': 'row-reverse',
  'right': 'row'
}

const DataPointGroup = styled.div`
  margin: 20px 5px;
  padding-left: 10px;
  text-align: left;
  padding-left:10%
  width: 100%;
  display: flex;
  flex-shrink: ${props => props.layout === 'horizontal' ? 'auto' : 0 };
  flex-direction: ${props => props.comparisonPlacement ? dataPointGroupDirectionDict[props.comparisonPlacement] : 'column'};
  align-items: center;
  justify-content: center;
`
const Divider = styled.div`
  background-color: #282828;
  height: 35vh;
  width: 1px;
`

const DataPoint = styled.div`
  display: flex;
  flex-shrink: ${props => props.layout === 'horizontal' ? 'auto' : 0 };
  flex-direction: ${props => props.titlePlacement === 'above' ? 'column' : 'column-reverse'};
  flex: 1;
  color: ${props => props.headerColor};
  width:100%;
  a.drillable-link {
    color: ${props => props.headerColor};
    text-decoration: none;
  };
`

const DataPointTitle = styled.div`
  font-weight: bold;
  font-size: 20px;
  margin: 5px 0;
  color: #01535E
`

const DataPointValue = styled.div`
  font-size: 20px;
  font-weight: bolder;
  :hover {
    text-decoration: underline;
  }
  color: ${props => props.color}
`

class MultipleValue extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {}
    this.state.groupingLayout = 'horizontal';
    this.state.fontSize = this.calculateFontSize();
  }

  componentDidMount() {
    window.addEventListener('resize', this.recalculateSizing);
  }

  componentDidUpdate() {
    this.recalculateSizing();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.recalculateSizing);
  }

  getWindowSize = () => {
    return Math.max(window.innerWidth, window.innerHeight);
  }

  calculateFontSize = () => {
    const multiplier = this.state.groupingLayout === 'horizontal' ? 0.015 : 0.02;
    return Math.round(this.getWindowSize() * multiplier);
  }

  handleClick = (cell, event) => {
    cell.link !== undefined ? LookerCharts.Utils.openDrillMenu({
         links: cell.link,
         event: event
    }) : LookerCharts.Utils.openDrillMenu({
         links: [],
         event: event
    });
  }

  recalculateSizing = () => {
    const EM = 16;
    const groupingLayout = window.innerWidth >= 768 ? 'horizontal' : 'vertical';

    let CONFIG = this.props.config;
    var font_size = (CONFIG.font_size_main != "" ? CONFIG.font_size_main : this.calculateFontSize());
    font_size = font_size / EM;


    this.setState({
      fontSize: font_size,
      groupingLayout
    })
  }

  render() {
    const {config, data} = this.props;
    let CONFIG = this.props.config;
    let firstPoint = data[0];
    let restPoints = data.slice(1)
    let pos = config[`pos_is_bad_${restPoints[0].name}`]


    return (
      <DataPointsWrapper
        layout={config['orientation'] === 'auto' ? this.state.groupingLayout : config['orientation']}
        font={config['grouping_font']}
        style={{fontSize: `${this.state.fontSize}em`}}
        headerBackground = {((firstPoint.value - restPoints[0].value) * (pos * 2 - 1)) < 0 ? "#02545F" : "#F3C911"}
      >
              <>
              <DataPointGroup 
                comparisonPlacement={config[`comparison_direction_${firstPoint.name}`]}
                key={`group_${firstPoint.name}`} 
                //next line had the this.state
                layout={config['orientation'] === 'auto' ? this.state.groupingLayout : config['orientation']}
              >
                <DataPoint 
                titlePlacement={config[`title_placement_${firstPoint.name}`]}
                headerColor = {config['header_text_color']}                
                >
                  {config[`show_title_${firstPoint.name}`] === false ? null : (
                    <DataPointTitle>
                      {config[`title_overrride_${firstPoint.name}`] || firstPoint.label}
                    </DataPointTitle>
                  )}
                  <DataPointValue 
                    onClick={() => { this.handleClick(firstPoint, event) }}
                    layout={config['orientation'] === 'auto' ? this.state.groupingLayout : config['orientation']}
                    color = {config['subtext_color']}
                  >
                    {firstPoint.formattedValue}
                  </DataPointValue>
                </DataPoint>
                {!restPoints.length > 0 ? null : (
                  restPoints.map((point,index) => {
                    if(!point.value){return ""}
                    let progressPerc
                    let percChange
                    progressPerc = Math.round((firstPoint.value / point.value) * 100)
                    percChange = progressPerc - 100 
                    return (
                <ComparisonDataPoint 
                  //key = "keyOne"
                  config={config}
                  compDataPoint={point}
                  dataPoint={firstPoint}
                  percChange= {percChange}
                  progressPerc={progressPerc}
                  handleClick={this.handleClick}
                />)}))}
              </DataPointGroup>
              </>
   
      </DataPointsWrapper>
    )

  }
}

MultipleValue.propTypes = {
  config: PropTypes.object,
  data: PropTypes.array,
};

export default MultipleValue;
