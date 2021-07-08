import fs from 'fs';

export function writeJSONToFile(
  data: any,
  filename = 'output_file.json'
): void {
  let json = JSON.stringify(data);
  fs.writeFile(filename, json, () => {});
}
