// Project Type
export enum ProjectStatus {
    Active,
    Finished,
  }
  
  // you can use class as a type
  export class Project {
    constructor(
      public id: string,
      public title: string,
      public description: string,
      public people: number,
      public status: ProjectStatus
    ) {}
  }