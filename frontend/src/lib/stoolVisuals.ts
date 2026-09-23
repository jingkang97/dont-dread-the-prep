import type { ApiStoolScaleStage } from "./api";

export const STAGE_LOOK: Record<string, Record<number, string>> = {
  "ttsh-6": {
    1: "Dark, thick lumps. Heavy residue, not watery.",
    2: "Brown soft blobs. Lots of residue still in the cup.",
    3: "Cloudy brown liquid with particles throughout.",
    4: "Dark orange liquid. Some residue left, not yet clear.",
    5: "Light orange. Little residue.",
    6: "Clear yellow, watery, no residue.",
  },
  "skh-6": {
    1: "Very dark liquid with solid materials at the bottom.",
    2: "Brown liquid with materials still sitting at the bottom.",
    3: "Dark orange. Some particles left.",
    4: "Light orange. Little residue.",
    5: "Clear yellow, watery, no residue.",
  },
};

export function stageLook(scaleKey: string, stage: ApiStoolScaleStage) {
  return stage.look?.trim() || STAGE_LOOK[scaleKey]?.[stage.n] || "";
}

export function stagePhotoSrc(stage: ApiStoolScaleStage) {
  if (!stage.photo) return null;
  return `/stool/${stage.photo}`;
}

export function extraStageSlots(
  scaleKey: string,
  stage: ApiStoolScaleStage,
  lastN: number,
) {
  if (stage.n < lastN - 1) return 0;
  return isCupScale(scaleKey) ? 2 : 0;
}

export function extraStagePhotos(
  scaleKey: string,
  stage: ApiStoolScaleStage,
  lastN: number,
) {
  if (extraStageSlots(scaleKey, stage, lastN) === 0) return [];
  if (scaleKey === "ttsh-6")
    return [`/stool/ttsh/s${stage.n}-2.png`, `/stool/ttsh/s${stage.n}-3.png`];
  if (scaleKey === "skh-6")
    return [`/stool/skh/${stage.n}-2.png`, `/stool/skh/${stage.n}-3.png`];
  return [];
}

export function isCupScale(scaleKey: string) {
  return scaleKey === "ttsh-6" || scaleKey === "skh-6";
}
