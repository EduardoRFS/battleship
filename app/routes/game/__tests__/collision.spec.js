import { createObject, testCollision } from '../collision';

describe('Collision', () => {
  test('shot', () => {
    const objectA = createObject(0, 1, 5, 2);
    const objectB = createObject(2, 1, 1, 1);

    const collide = testCollision(objectA, objectB);
    expect(collide).toBe(true);
  });
  test('area', () => {
    const objectA = createObject(0, 0, 5, 1);
    const objectB = createObject(4, 0, 2, 2);

    const collide = testCollision(objectA, objectB);
    expect(collide).toBe(true);
  });
  test('none', () => {
    const objectA = createObject(0, 0, 4, 2);
    const objectB = createObject(0, 3, 4, 3);

    const dontCollide = testCollision(objectA, objectB);
    expect(dontCollide).toBe(false);
  });
});
