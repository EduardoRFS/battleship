const GRID = 10;
const sizes = {
  aircraft_carrier: 5,
  battleship: 4,
  submarine: 3,
  destroyer: 3,
  boat: 2,
};

export const createObject = (x, y, width, height) => ({
  x: +x,
  y: +y,
  width: +width,
  height: +height,
});
export const unitToObject = ([type, unit]) => {
  const { position, rotation } = unit;
  const size = sizes[type];
  return createObject(
    position.x,
    position.y,
    rotation === 'horizontal' ? size : 1,
    rotation === 'horizontal' ? 1 : size
  );
};
export const isInsideGrid = object => {
  const { x, y, width, height } = object;
  const x2 = x + width;
  const y2 = y + height;

  return x >= 0 && y >= 0 && x2 < GRID && y2 < GRID;
};
export const testCollision = (objectA, objectB) => {
  return (
    objectA.x < objectB.x + objectB.width &&
    objectA.x + objectA.width > objectB.x &&
    objectA.y < objectB.y + objectB.height &&
    objectA.y + objectA.height > objectB.y
  );
};
