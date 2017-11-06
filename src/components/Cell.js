import React from 'react'
import './cell.css'
import _ from 'lodash'

const klass = props => {
  return _.filter(['level', 'direction', 'owner'], k=>props[k]!==undefined).map(k=>`${k}-${props[k]}`).join(' ') + ` cell ${props.type || 'closed'}` + `${props.achievable ? ' achievable' : ''}`;
}

const Cell = (props) => {
  return (<div className={klass(props)} onClick={props.onClick} data-level={props.level}>
    {props.children}
  </div>)
}
export default Cell;
