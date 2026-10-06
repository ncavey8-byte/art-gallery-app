import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

export type CommissionPhoto = { uri: string; name: string; mimeType: string };

const MAX_DIMENSION = 2400;

// Re-encode as JPEG so iPhone HEIC photos open anywhere, and shrink huge images for email.
async function toJpeg(asset: ImagePicker.ImagePickerAsset, index: number): Promise<CommissionPhoto> {
  const baseName = (asset.fileName ?? `photo-${index + 1}`).replace(/\.[^.]+$/, '');
  try {
    const context = ImageManipulator.manipulate(asset.uri);
    if (Math.max(asset.width, asset.height) > MAX_DIMENSION) {
      context.resize(asset.width >= asset.height ? { width: MAX_DIMENSION } : { height: MAX_DIMENSION });
    }
    const image = await context.renderAsync();
    const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 });
    return { uri: saved.uri, name: `${baseName}.jpg`, mimeType: 'image/jpeg' };
  } catch {
    // e.g. desktop browsers that can't decode HEIC: send the original file instead.
    return { uri: asset.uri, name: asset.fileName ?? `${baseName}.jpg`, mimeType: asset.mimeType ?? 'image/jpeg' };
  }
}

export async function pickPhotos(source: 'library' | 'camera', limit: number): Promise<CommissionPhoto[]> {
  let result: ImagePicker.ImagePickerResult;
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) throw new Error('Camera access is needed to take a photo. You can enable it in Settings.');
    result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 });
  } else {
    result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: limit,
      quality: 1,
    });
  }
  if (result.canceled) return [];
  return Promise.all(result.assets.slice(0, limit).map(toJpeg));
}
