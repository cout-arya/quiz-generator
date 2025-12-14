
fetch('http://localhost:5000/api/quizzes/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: 'Space' })
})
    .then(res => res.json())
    .then(data => {
        console.log('API Response:', JSON.stringify(data, null, 2));
    })
    .catch(err => console.error('API Error:', err));
