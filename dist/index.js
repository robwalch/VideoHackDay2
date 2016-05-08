jwplayer('player').setup({
  key: '0pNBbqmnocxnj2i9nEYGywGYoc0rMIDXH/T7TkUN6o9QP+XKD+oT5OAhjYk=',
  // primary: 'flash',
  autostart: true,
  width: '100%',
  aspectratio: '16:9',
  // skin: 'six',
  playlist: '//content.jwplatform.com/feeds/2RD6nhsq.json',
}).on('playlistItem', function(e) {
  // find the first mp4 source that is not a '.m4a' AAC audio file.
  var mp4Url = e.item.allSources
    .reduce((res, item) => (item.type === 'mp4' && !/\.m4a$/.test(item.file)) ? item:res, {})
    .file.replace(/^\/\//, 'http://');

  var clarifaiToken = 'B7NMoX8ES4kTSzNZGl0HWfVn9fyrmH';//'fCYosSIAkbjD69Hbe1OACkfJQiqflj'//;'AzGuIiXTPe44xmEn889F41Zyfqvoby';//
  var clarifaiTagUrl = `https://api.clarifai.com/v1/tag?url=${encodeURIComponent(mp4Url)}&access_token=${clarifaiToken}`;

  var cachedJSON = localStorage.getItem(mp4Url);
  if (cachedJSON) {
    console.log('Using cached clarifai response.');
    e.item.tagData = JSON.parse(cachedJSON);
  }
  fetch(clarifaiTagUrl)
    .then(response => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    })
    .then(o => {
      if (!o.results || !o.results.length) {
        throw Error('No results from clarifai.');
      }
      return o.results[0].result.tag;
    })
    .then(tagData => {
      localStorage.setItem(mp4Url, JSON.stringify(tagData))
      return tagData;
    })
    .then(tagData => e.item.tagData = tagData)
    .catch(err => console.error(err))
  }).on('time', function(e) {
    var item = this.getPlaylistItem();
    tagData = item.tagData;
    if (!tagData) return;
    var classes = tagData.classes[e.position|0];
    // var probs = tagData.probs[e.position|0];
    this.getContainer().querySelector('.jw-overlays').innerHTML = classes.join('<br>');
  });
