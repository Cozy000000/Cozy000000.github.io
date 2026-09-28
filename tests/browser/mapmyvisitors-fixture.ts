export const mapScriptRoute = /^https:\/\/mapmyvisitors\.com\/map\.js(?:\?|$)/;

// Follow the official script's two phases: insert a loading shell, then draw
// the SVG after data arrives. No provider requests or visitor records are made.
export function mapWidgetMock(dataDelay = 0) {
  return `
    const link = document.createElement('a');
    link.id = 'mapmyvisitors-widget';
    link.href = 'https://mapmyvisitors.com/';
    link.target = '_top';
    link.innerHTML = '<div class="mapmyvisitors-map-container" style="background:#fff0f5"><div style="height:32px;text-align:center;color:#3d2632">Mock visitor map — no real visitor data</div><div class="mapmyvisitors-map" style="width:520px;height:255px"><div class="mapmyvisitors-loading">Loading data...</div></div></div>';
    document.body.append(link);
    setTimeout(() => {
      link.querySelector('.mapmyvisitors-map').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 420 206"><path d="M76 63l42-20 33 21-13 34-25 14-17-27z M160 124l22 9-3 40-19-9-9-25z M221 58l49-13 62 23 5 31-45 4-17 29-22-35-30-9z M308 144l36-9 15 26-37 12z" fill="#f3bfd0"/><circle cx="310" cy="92" r="5" fill="#b92420"/></svg>';
    }, ${dataDelay});
  `;
}
