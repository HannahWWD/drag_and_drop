 export interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
  }
  
 export interface DragTarget {
    dragOverHandler(event: DragEvent): void; // signal the browser this is a valid drag target;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void; //revert visual update
  }