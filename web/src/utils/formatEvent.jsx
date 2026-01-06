import {
  audienceColorMap,
  audienceMap,
  billsStateColorMap,
  billsStateIconMap,
  billsStateMap,
  locationMap,
  stateColorMap,
  stateIconMap,
  stateMap,
  stateShortMap,
} from "constants/events";

export function audienceLabels(audience) {
  return audience?.map((a) => ({
    name: audienceMap[a],
    color: audienceColorMap[a],
  }));
}

export function stateLabel(state) {
  return {
    name: stateMap[state],
    shortName: stateShortMap[state],
    color: stateColorMap[state],
    icon: stateIconMap[state],
  };
}

export function billsStateLabel(state) {
  return {
    name: billsStateMap[state],
    color: billsStateColorMap[state],
    icon: billsStateIconMap[state],
  };
}

export function locationLabel(location) {
  return { name: locationMap[location] };
}
