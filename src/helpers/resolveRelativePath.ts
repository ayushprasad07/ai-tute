export function resolveRelativePath(
  currentPath: string,
  importPath: string
) {

  const currentDir = currentPath
    .split("/")
    .slice(0, -1)
    .join("/");

  const combined =
    currentDir + "/" + importPath;

  const normalized =
    combined
      .split("/")
      .reduce<string[]>((acc, part) => {

        if (part === "." || part === "") return acc;

        if (part === "..") acc.pop();
        else acc.push(part);

        return acc;

      }, [])
      .join("/");

  return normalized;
}