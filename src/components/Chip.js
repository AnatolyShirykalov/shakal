import React from 'react'
import './chip.css'

const Chip = props => {
  return (
    <div className={`chip type-${props.type} owner-${props.owner} ${props.selected ? 'selected' : ''} ${props.sinked ? 'sinked' : ''}`} onClick={props.onClick} data-level={props.level}/>
  )
}

export default Chip;
