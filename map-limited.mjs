// Allocate a fixed number of worker promises, rather than one per catalogue row.
export async function mapLimited(items, transform, concurrency = 8) {
  const output=new Array(items.length);
  let next=0;
  await Promise.all(Array.from({length:Math.min(concurrency,items.length)},async()=>{
    while(next < items.length) {
      const index=next++;
      output[index]=await transform(items[index],index);
    }
  }));
  return output;
}
