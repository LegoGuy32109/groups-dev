export function getGroupColor(groupName: string) {
  const groupLowered = groupName.toLowerCase();
  if (/girl|wom[ae]n|female|sister/.test(groupLowered)) {
    return "#7D2859"; // pink
  }
  if (/boy|m[ae]n|male|brother/.test(groupLowered)) {
    return "#1E3879"; // blue
  }
  return "#1A6642"; // green
}
