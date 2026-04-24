import {Building} from "../components/building";
import {Tile} from "../components/tile";
import {Sky} from "../components/sky";


export function createWorld(scene) {
    const building = new Building();
    scene.add(building);

    const sky = new Sky();
    scene.add(sky);

    const tile = new Tile(100, 10);
    scene.add(tile);

    return {
        building,
        tile,
        sky
    };
}