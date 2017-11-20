import React from 'react'

const Sync = ({sendGame, myPlayer}) => {
  if (myPlayer !== 0) {
    return <div/>
  }
  return (
    <div className="sync">
      <button onClick={sendGame}>Отправить поле</button>
    </div>
  );
};

export default Sync;
