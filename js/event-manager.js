/**
 * Event Manager
 * Handles dynamic loading and rendering of event registration data
 */

class EventManager {
    constructor() {
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            await this.loadStats();
            await this.loadMyEvents();
            await this.loadUpcomingEvents();
            this.initialized = true;
        } catch (error) {
            console.error('EventManager initialization failed:', error);
            this.showError('데이터를 불러오는 중 오류가 발생했습니다.');
        }
    }

    async loadStats() {
        try {
            const stats = await window.ApiClient.events.getMyStats();

            // 통계 카드 업데이트
            const totalEl = document.querySelector('[data-stat="total"]');
            const completedEl = document.querySelector('[data-stat="completed"]');
            const upcomingEl = document.querySelector('[data-stat="upcoming"]');
            const certificatesEl = document.querySelector('[data-stat="certificates"]');

            if (totalEl) totalEl.textContent = stats.total + '회';
            if (completedEl) completedEl.textContent = stats.completed + '회';
            if (upcomingEl) upcomingEl.textContent = stats.upcoming + '회';
            if (certificatesEl) certificatesEl.textContent = stats.certificates + '건';

            // 필터 탭 업데이트
            const filterAll = document.querySelector('[data-filter="all"]');
            const filterUpcoming = document.querySelector('[data-filter="upcoming"]');
            const filterCompleted = document.querySelector('[data-filter="completed"]');
            const filterCancelled = document.querySelector('[data-filter="cancelled"]');

            if (filterAll) filterAll.textContent = `전체 (${stats.total})`;
            if (filterUpcoming) filterUpcoming.textContent = `예정 (${stats.upcoming})`;
            if (filterCompleted) filterCompleted.textContent = `완료 (${stats.completed})`;
            if (filterCancelled) filterCancelled.textContent = `취소 (${stats.cancelled})`;

        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    async loadMyEvents() {
        try {
            const events = await window.ApiClient.events.getMyRegistrations();
            this.renderEventList(events);
        } catch (error) {
            console.error('Failed to load my events:', error);
        }
    }

    async loadUpcomingEvents() {
        try {
            const events = await window.ApiClient.events.getUpcoming();
            this.renderUpcomingEvents(events);
        } catch (error) {
            console.error('Failed to load upcoming events:', error);
        }
    }

    renderUpcomingEvents(events) {
        const container = document.querySelector('.upcoming-grid');
        if (!container || events.length === 0) return;

        container.innerHTML = events.map(event => `
            <div class="upcoming-card">
                <span class="upcoming-date">예정</span>
                <div class="upcoming-event-title">${event.title || event.short_title}</div>
                <div class="upcoming-info">
                    <i class="fas fa-calendar"></i> ${this.formatDate(event.created_at)}
                </div>
            </div>
        `).join('');
    }

    renderEventList(events) {
        const container = document.querySelector('.event-section');
        if (!container) return;

        const listHTML = events.map(event => this.createEventCard(event)).join('');

        // 기존 이벤트 카드 제거 후 새로 추가
        const existingCards = container.querySelectorAll('.event-card');
        existingCards.forEach(card => card.remove());

        const sectionTitle = container.querySelector('.section-title');
        if (sectionTitle) {
            sectionTitle.insertAdjacentHTML('afterend', listHTML);
        }
    }

    createEventCard(event) {
        const statusInfo = this.getStatusInfo(event.status);
        const eventDate = new Date(event.event_date);

        return `
            <div class="event-card" data-status="${event.status}">
                <div class="event-date-badge" style="${statusInfo.badgeStyle}">
                    <div class="badge-day">${eventDate.getDate()}</div>
                    <div class="badge-month">${eventDate.getFullYear()}.${String(eventDate.getMonth() + 1).padStart(2, '0')}</div>
                </div>
                <div class="event-content">
                    <div class="event-header">
                        <div style="flex: 1;">
                            <span class="event-type">${event.category || '포럼'}</span>
                            <div class="event-title">${event.title}</div>
                            <div class="event-meta">
                                <div class="event-meta-item">
                                    <i class="fas fa-calendar-alt"></i> ${this.formatDate(event.event_date)}
                                </div>
                            </div>
                        </div>
                        <span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>
                    </div>
                    
                    ${event.status === 'confirmed' ? this.renderConfirmedActions(event) : ''}
                    ${event.status === 'completed' ? this.renderCompletedActions(event) : ''}
                    ${event.status === 'cancelled' ? this.renderCancelledActions(event) : ''}
                </div>
            </div>
        `;
    }

    renderConfirmedActions(event) {
        return `
            <div class="event-actions">
                <button class="btn-small btn-primary-small" onclick="window.eventManager.viewDetail(${event.post_id})">
                    <i class="fas fa-info-circle"></i> 상세정보
                </button>
                <button class="btn-small btn-outline-small" onclick="window.eventManager.addToCalendar(${event.post_id})">
                    <i class="fas fa-calendar-plus"></i> 캘린더 추가
                </button>
                <button class="btn-small btn-danger-small" onclick="window.eventManager.cancelRegistration(${event.registration_id})">
                    <i class="fas fa-times"></i> 신청 취소
                </button>
            </div>
        `;
    }

    renderCompletedActions(event) {
        return `
            <div class="event-actions">
                <button class="btn-small btn-primary-small" onclick="window.eventManager.viewDetail(${event.post_id})">
                    <i class="fas fa-info-circle"></i> 상세정보
                </button>
                <button class="btn-small btn-secondary-small" onclick="window.eventManager.downloadCertificate(${event.registration_id})">
                    <i class="fas fa-certificate"></i> 수료증 다운로드
                </button>
            </div>
        `;
    }

    renderCancelledActions(event) {
        return `
            <div class="event-actions">
                <button class="btn-small btn-primary-small" onclick="window.eventManager.viewDetail(${event.post_id})">
                    <i class="fas fa-info-circle"></i> 상세정보
                </button>
            </div>
        `;
    }

    getStatusInfo(status) {
        const statusMap = {
            'confirmed': {
                text: '참가확정',
                class: 'confirmed',
                badgeStyle: 'background: linear-gradient(135deg, #1e7e34, #28a745);'
            },
            'completed': {
                text: '참석완료',
                class: 'completed',
                badgeStyle: 'background: linear-gradient(135deg, #6c757d, #495057);'
            },
            'cancelled': {
                text: '신청취소',
                class: 'cancelled',
                badgeStyle: 'background: linear-gradient(135deg, #dc3545, #c82333);'
            }
        };

        return statusMap[status] || statusMap['confirmed'];
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    }

    async cancelRegistration(registrationId) {
        if (!confirm('정말로 신청을 취소하시겠습니까?')) {
            return;
        }

        try {
            await window.ApiClient.events.cancel(registrationId);
            alert('신청이 취소되었습니다.');
            await this.init(); // 데이터 다시 로드
        } catch (error) {
            console.error('Failed to cancel registration:', error);
            alert('취소 처리 중 오류가 발생했습니다.');
        }
    }

    viewDetail(postId) {
        window.location.href = `../core/forum-new.html?id=${postId}`;
    }

    addToCalendar(postId) {
        alert('캘린더 추가 기능은 준비 중입니다.');
    }

    downloadCertificate(registrationId) {
        alert('수료증 다운로드 기능은 준비 중입니다.');
    }

    showError(message) {
        const container = document.querySelector('.event-section');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${message}</p>
                </div>
            `;
        }
    }
}

// Export to global scope
window.EventManager = EventManager;
window.eventManager = new EventManager();
