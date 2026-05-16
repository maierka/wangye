async function toggleFavorite(button) {
    const productId = button.dataset.productId;
    const isFavorited = button.classList.contains('favorited');
    const method = isFavorited ? 'DELETE' : 'POST';

    try {
        const response = await fetch('/api/favorites' + (isFavorited ? '/' + productId : ''), {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({product_id: productId})
        });

        if (response.status === 401) {
            alert('请先登录');
            window.location.href = '/login';
            return;
        }

        const data = await response.json();
        if (response.ok) {
            button.classList.toggle('favorited');
            button.textContent = isFavorited ? '🤍' : '❤️';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('操作失败，请重试');
    }
}

document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        });
        if (response.ok) {
            window.location.href = '/';
        }
    } catch (error) {
        window.location.href = '/';
    }
});
