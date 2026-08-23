import type Konva from "konva";

// Bo props tuong tac DUNG CHUNG cho ca 4 loai shape (Text/Image/Table/Sticker) -
// KonvaCanvas.tsx tao ra bo nay cho TUNG element roi truyen xuong qua
// CanvasElementRenderer.tsx, moi Shape component chi gan THANG len node Konva
// GOC cua no (Text/Image/Group deu ke thua Konva.Node nen deu ho tro
// draggable/onClick/onDragEnd/onTransformEnd giong nhau). KHONG co callback
// ref o day co chu dich - dong 1 function dong goi `.current` cua 1 ref o
// component cha (KonvaCanvas) roi truyen qua props de component con doc lai
// bi eslint react-hooks/refs cua repo nay coi la "doc ref luc render" (da
// gap loi nay khi thu). Transformer tra node qua `stage.findOne('#'+id)`
// (id da gan san tren moi shape) thay vi tu quan 1 Map ref thu cong.
export type ElementInteraction = {
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
};
