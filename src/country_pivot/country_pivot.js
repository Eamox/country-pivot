import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {formatType, lighten} from '../common'
import { ComparisonDataPoint } from './ComparisonDataPoint'

const CountriesWrapper = styled.div`
  font-family: "Open Sans", "Noto Sans JP", "Noto Sans", "Noto Sans CJK KR", Helvetica, Arial, sans-serif;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 4px;
`

const CountryDiv = styled.div `
font-size:20px;
display:flex;
flex-direction: column`

const CountryNumber = styled.div `
color: #02545f
font-weight: bold`

const CountryTitle = styled.div`
color: #02545f;
font-weight: bold;
display: flex;`

const CountryDetails = styled.div`
display: flex`

const CountryChange = styled.div``

const CountryName = styled.div``



const CountryValue = styled.div``



class CountryPivot extends React.PureComponent {
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



    return (
      <CountriesWrapper
      >
        {data.map((country , number) => {return ( 
          <CountryDiv>
            <>
            <CountryTitle>
            {/* <CountryNumber>{number + 1}{'\u00A0-\u00A0'}</CountryNumber> */}
            <CountryName>{country[0].split("|")[0]}</CountryName>
            </CountryTitle>
            <CountryDetails>
            <CountryValue onClick= {() => {this.handleClick({link: country[1]},event)}} ><strong>{country[2].toLocaleString()} </strong></CountryValue>
            {country.length < 4 ? null :  ([country[2] > country[3]? (<div style={{color:"green"}}>▲</div>) : (<div style={{color:"red"}}>▼</div>) ,<CountryChange> {" "} {Math.floor(country[2] / (country[3] || 1)*100)}{"% SPLY"} </CountryChange>]  )}
            </CountryDetails>
            </>
          </CountryDiv>
            
          )})}
      </CountriesWrapper>
    )

  }
}

CountryPivot.propTypes = {
  config: PropTypes.object,
  data: PropTypes.array,
};

export default CountryPivot;
