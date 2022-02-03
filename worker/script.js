const getDateOfTheDay = () => {
  const date = new Date();
  const dateOfTheDay = new Intl.DateTimeFormat('fr-FR', { month: '2-digit', day: '2-digit', year: 'numeric' }).format(date);
  return dateOfTheDay
};

const listHits = async () => {
  const listHits = await FFS_DATA.list({"prefix": "hits:"});
  let allHits = {};

  for (const hit of listHits.keys) {
    const hits = await FFS_DATA.get(hit.name);
    allHits[hit.name] = hits;
  }
  return allHits
};

const getHits = async () => {
  return await FFS_DATA.get(`hits:${getDateOfTheDay()}`);
};

const incrementHits = async () => {
  const hits = await getHits();
  await FFS_DATA.put(`hits:${getDateOfTheDay()}`, Number(hits) + 1);
};

const afterSlash = (request) => {
  const removeHttp = request.url.slice(request.url.indexOf("//") + 2);
  return removeHttp.slice(removeHttp.indexOf("/") + 1);
};

async function handleRequest(event) {
  const { request } = event;

  if (await getHits() === null) {
    FFS_DATA.put(getDateOfTheDay(), Number(0));
  }

  const url = afterSlash(request)

  if (url === "stats") {
    return new Response(await FFS_DATA.get('html:stats'), {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  } else if (url === "json") {
    const hits = await listHits();

    const json = JSON.stringify(hits, null, 2)
    return new Response(json, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "content-type": "application/json;charset=UTF-8"
      }
    })
  } else {
    await incrementHits();
    return Response.redirect('https://ffs.zerator.com/', 302);
  }
}

addEventListener('fetch', async event => {
  event.respondWith(handleRequest(event))
})
