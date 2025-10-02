import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent,ActionSheetController, ToastController, } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

interface User {
  id: string;
  displayName: string;
  pronouns?: string;
  age?: number;
  city?: string;
  photoUrl?: string;
  topInterests: string[];
  bio?: string;
  isOnline?: boolean;
  distanceKm?: number;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent],
})
export class Tab1Page implements OnInit {
  // view type toggles between 'list' and 'map' (used by toggleView())
  viewType: 'list' | 'map' = 'list';

  // quick filter segment value (all, anime, ttrpg, gaming, cosplay, etc.)
  quickFilter = 'all';

  // search input model
  searchTerm = '';

  // All users (mock). In real app this will come from a service.
  users: User[] = [
    {
      id: 'u1',
      displayName: 'Nymira',
      pronouns: 'she/they',
      age: 26,
      city: 'Chicago',
      photoUrl: 'assets/mock/nyimira.jpg',
      topInterests: ['TTRPG', 'Eladrin lore', 'Cosplay'],
      bio: 'GM who loves tragic backstories. Looking for people to run sandbox campaigns.',
      isOnline: true,
      distanceKm: 3.2,
    },
    {
      id: 'u2',
      displayName: 'Korrin the Colossus',
      pronouns: 'he/him',
      age: 29,
      city: 'Naperville',
      photoUrl: 'assets/mock/korrin.jpg',
      topInterests: ['Fighting games', 'Speedruns', 'Retro'],
      bio: 'Barbarian IRL. Teach me your favorite ROM hacks.',
      isOnline: false,
      distanceKm: 18.6,
    },
    {
      id: 'u3',
      displayName: 'MiraCoder',
      pronouns: 'they/them',
      age: 24,
      city: 'Online',
      photoUrl: 'assets/mock/miracoder.jpg',
      topInterests: ['Indie dev', 'JRPGs', 'Anime'],
      bio: 'Building games & writing chiptune. Always down for a collab.',
      isOnline: true,
      distanceKm: 0,
    },
    // add more mock users here...
  ];

  // Filtered list shown in the template
  filteredUsers: User[] = [];
  constructor(
      private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit(): void {
    // initialize filteredUsers
    this.computeFilteredUsers();
  }

  // Toggle between list/map view (stub)
  toggleView(): void {
    this.viewType = this.viewType === 'list' ? 'map' : 'list';
    this.presentToast(`Switched to ${this.viewType} view.`);
  }

  // Open filters (action sheet stub). Replace with modal for full filter UI.
  async openFilters(): Promise<void> {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Quick Filters',
      buttons: [
        {
          text: 'Sort: Closest',
          handler: () => {
            this.filteredUsers = [...this.filteredUsers].sort(
              (a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999)
            );
            this.presentToast('Sorted by distance');
          },
        },
        {
          text: 'Only Online',
          handler: () => {
            this.filteredUsers = this.filteredUsers.filter(u => u.isOnline);
            this.presentToast('Showing online users');
          },
        },
        {
          text: 'Reset Filters',
          handler: () => {
            this.searchTerm = '';
            this.quickFilter = 'all';
            this.computeFilteredUsers();
            this.presentToast('Filters reset');
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

  // Called on ionInput of the searchbar (debounce already configured in template)
  filterUsers(): void {
    this.computeFilteredUsers();
  }

  // Called when quick filter segment changes
  applyQuickFilter(): void {
    this.computeFilteredUsers();
  }

  // Compute filteredUsers from users, searchTerm and quickFilter
  private computeFilteredUsers(): void {
    const q = (this.searchTerm || '').trim().toLowerCase();
    const filter = this.quickFilter || 'all';

    this.filteredUsers = this.users.filter(user => {
      // quick filter on interests
      if (filter !== 'all') {
        const interestMatch = user.topInterests.some(i =>
          i.toLowerCase().includes(filter)
        );
        if (!interestMatch) {
          return false;
        }
      }

      // search term matches displayName, interests, or bio
      if (!q) {
        return true;
      }

      const matchesName = user.displayName.toLowerCase().includes(q);
      const matchesInterests = user.topInterests.some(i =>
        i.toLowerCase().includes(q)
      );
      const matchesBio = (user.bio || '').toLowerCase().includes(q);
      const matchesCity = (user.city || '').toLowerCase().includes(q);

      return matchesName || matchesInterests || matchesBio || matchesCity;
    });

    // optional: stable sort by online first then distance
    this.filteredUsers.sort((a, b) => {
      if ((a.isOnline ? 1 : 0) !== (b.isOnline ? 1 : 0)) {
        return (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0);
      }
      return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999);
    });
  }

  // User actions (like / pass / superLike)
  async like(user: User): Promise<void> {
    // TODO: call backend service to persist like
    await this.presentToast(`Liked ${user.displayName} ♥`);
    // optimistic UI: optionally remove card or mark as liked
  }

  async pass(user: User): Promise<void> {
    // TODO: call backend service to persist pass
    await this.presentToast(`Passed on ${user.displayName}`);
    // optimistic UI: remove card from feed
    this.filteredUsers = this.filteredUsers.filter(u => u.id !== user.id);
  }

  async superLike(user: User): Promise<void> {
    // TODO: call backend for super-like (credits, cooldowns)
    await this.presentToast(`Super-liked ${user.displayName} ✨`);
    // optimistic UI: highlight user or remove card
  }

  // Small helper to show quick feedback to the tester
  private async presentToast(message: string): Promise<void> {
    const t = await this.toastCtrl.create({
      message,
      duration: 1_200,
      position: 'bottom',
    });
    await t.present();
  }
}
