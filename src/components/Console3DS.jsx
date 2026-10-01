// Guscio della console (skin "pokeball"). Non sa nulla di Pokémon:
// riceve i due schermi e le azioni dei tasti.
export default function Console3DS({ top, bottom, on, music, actions: k }) {
  return (
    <div className={`console ${on ? "" : "is-off"}`} data-skin="pokeball">
      <button className="shoulder shoulder--l" onClick={k.l} aria-label="L: indietro di 10">L</button>
      <button className="shoulder shoulder--r" onClick={k.r} aria-label="R: avanti di 10">R</button>

      <section className="shell shell--top">
        <div className="sensors">
          <i className="led led--power" />
          <i className="camera" />
          <i className="led led--blue" />
        </div>
        <div className="top-row">
          <div className="side"><div className="speaker" /></div>
          <div className="screen screen--top">{top}</div>
          <div className="side">
            <div className={`slider3d ${music ? "" : "is-down"}`} role="img" aria-label={music ? "Musica accesa" : "Musica spenta"}><i /></div>
            <div className="speaker" />
          </div>
        </div>
        <p className="badge">Pokédex</p>
      </section>

      <div className="hinge"><span className="ball" /></div>

      <section className="shell shell--bottom">
        <div className="pad">
          <div className="left">
            <div className="circlepad"><i /></div>
            <div className="dpad" role="group" aria-label="Croce direzionale">
              <button className="dpad__btn dpad__up" onClick={k.up} aria-label="Su" />
              <button className="dpad__btn dpad__left" onClick={k.left} aria-label="Sinistra" />
              <button className="dpad__btn dpad__right" onClick={k.right} aria-label="Destra" />
              <button className="dpad__btn dpad__down" onClick={k.down} aria-label="Giù" />
            </div>
          </div>

          <div className="screen screen--bottom">{bottom}</div>

          <div className="right">
            <div className="face" role="group" aria-label="Pulsanti">
              <button className="face__btn face__x" onClick={k.x} aria-label="X: cerca">X</button>
              <button className="face__btn face__y" onClick={k.y} aria-label="Y: versione shiny">Y</button>
              <button className="face__btn face__a" onClick={k.a} aria-label="A: seleziona">A</button>
              <button className="face__btn face__b" onClick={k.b} aria-label="B: indietro">B</button>
            </div>
            <div className="startsel">
              <button className="pill" onClick={k.select}>Select</button>
              <button className="pill" onClick={k.start}>Start</button>
            </div>
          </div>
        </div>

        <div className="menu-row">
          <button className="power" onClick={k.power} aria-label="Accendi o spegni"><span /></button>
          <button className="home" onClick={k.home} aria-label="Home"><span className="home__icon" /></button>
          <span />
        </div>
      </section>
    </div>
  );
}
