declare module 'expo-camera' {
  import { Component } from 'react';

  export class CameraView extends Component<any, any> {
    takePictureAsync(options?: any): Promise<any>;
  }

  export type CameraType = 'front' | 'back';

  export function useCameraPermissions(): [any, () => Promise<any>];
}
