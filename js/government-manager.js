/**
 * 한국ESG학회 - 정부기관 관리 JavaScript
 */

let currentEditId = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAdminPermission();
    loadGovernments();
});

function checkAdminPermission() {
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
    if (!user) {
        showCustomAlert('🔐 로그인이 필요합니다', () => {
            window.location.href = '../../index.html';
        });
        return;
    }
}

async function loadGovernments() {
    const container = document.getElementById('govList');

    try {
        const response = await ApiClient.government.getAll();
        const governments = response;

        if (!governments || governments.length === 0) {
            container.innerHTML = '<p style="text-align: center;">등록된 유관기관이 없습니다</p>';
            return;
        }

        container.innerHTML = governments.map(gov => `
            <div class="gov-card">
                <img src="${gov.logo_url}" alt="${gov.name}" class="gov-logo-preview"
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22%3E%3Ctext x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22Arial%22 font-size=%2212%22 fill=%22%23999%22%3E${gov.name}%3C/text%3E%3C/svg%3E'">
                <h3>${gov.name}</h3>
                <p>순서: ${gov.display_order}</p>
                <div class="gov-actions">
                    <button class="btn btn-small btn-edit" onclick="editGov('${gov.id}')">
                        <i class="fas fa-edit"></i> 수정
                    </button>
                    <button class="btn btn-small btn-danger" onclick="deleteGov('${gov.id}', '${gov.name}')">
                        <i class="fas fa-trash"></i> 삭제
                    </button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('❌ 유관기관 로드 실패:', error);
        showCustomAlert('❌ 유관기관을 불러오는데 실패했습니다');
    }
}

function openAddModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = '새 기관 추가';
    document.getElementById('govForm').reset();
    document.getElementById('govLogo').value = '';
    document.getElementById('fileName').textContent = '';
    document.getElementById('logoPreview').innerHTML = '';
    document.getElementById('govLogoFile').value = '';
    document.getElementById('govModal').classList.add('active');
}

async function editGov(id) {
    try {
        const gov = await ApiClient.request(`/government/${id}`);

        currentEditId = id;
        document.getElementById('modalTitle').textContent = '기관 수정';
        document.getElementById('govId').value = id;
        document.getElementById('govName').value = gov.name;
        document.getElementById('govLogo').value = gov.logo_url || '';
        document.getElementById('govUrl').value = gov.website_url || '';
        document.getElementById('govOrder').value = gov.display_order;
        document.getElementById('govModal').classList.add('active');

    } catch (error) {
        console.error('❌ 유관기관 로드 실패:', error);
        showCustomAlert('❌ 유관기관 정보를 불러오는데 실패했습니다');
    }
}

function closeModal() {
    document.getElementById('govModal').classList.remove('active');
    currentEditId = null;
}

document.getElementById('govForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const govData = {
        name: document.getElementById('govName').value.trim(),
        logo_url: document.getElementById('govLogo').value.trim(),
        website_url: document.getElementById('govUrl').value.trim() || '#',
        display_order: parseInt(document.getElementById('govOrder').value)
    };

    try {
        if (currentEditId) {
            await ApiClient.request(`/government/${currentEditId}`, {
                method: 'PUT',
                body: JSON.stringify(govData)
            });
        } else {
            await ApiClient.request('/government', {
                method: 'POST',
                body: JSON.stringify(govData)
            });
        }

        showCustomAlert(
            currentEditId ? '✅ 유관기관이 수정되었습니다' : '✅ 유관기관이 추가되었습니다',
            () => {
                closeModal();
                loadGovernments();
            }
        );

    } catch (error) {
        console.error('❌ 저장 실패:', error);
        showCustomAlert('❌ 저장에 실패했습니다');
    }
});

async function deleteGov(id, name) {
    if (!confirm(`"${name}"을(를) 삭제하시겠습니까?`)) return;

    try {
        await ApiClient.request(`/government/${id}`, {
            method: 'DELETE'
        });

        showCustomAlert('✅ 유관기관이 삭제되었습니다', () => {
            loadGovernments();
        });

    } catch (error) {
        console.error('❌ 삭제 실패:', error);
        showCustomAlert('❌ 삭제에 실패했습니다');
    }
}

document.getElementById('govModal').addEventListener('click', (e) => {
    if (e.target.id === 'govModal') closeModal();
});
