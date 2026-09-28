import * as ImagePicker from 'expo-image-picker';

/** iOS Photos permission is required before `launchImageLibraryAsync`. */
export async function ensurePhotoLibraryAccessForPicker(): Promise<boolean> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return permission.granted;
}

export function launchImageLibraryAsync(
  options: ImagePicker.ImagePickerOptions,
) {
  return ImagePicker.launchImageLibraryAsync(options);
}
