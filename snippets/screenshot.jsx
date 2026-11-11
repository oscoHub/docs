export const Screenshot = ({ name, alt, caption }) => (
  <Frame caption={caption}>
    <img className="block dark:hidden" src={`/images/${name}-light.png`} alt={alt} />
    <img className="hidden dark:block" src={`/images/${name}-dark.png`} alt={alt} />
  </Frame>
);
