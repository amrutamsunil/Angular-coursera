import { baseURL } from "./../shared/baseurl";
import { DishService } from "./../services/dish.service";
import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import { Dish } from "../shared/dish";
import { Params, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { switchMap } from "rxjs/operators";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Comment } from "../shared/comment";
@Component({
  selector: "app-dishdetail",
  templateUrl: "./dishdetail.component.html",
  styleUrls: ["./dishdetail.component.scss"],
})
export class DishdetailComponent implements OnInit {
  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  comment: Comment;
  commentForm: FormGroup;
  formErrors = {
    author: "",
    rating: "",
    comment: "",
  };
  errMess: string;
  @ViewChild("cform") commentFormDirective;

  constructor(
    private dishservice: DishService,
    private location: Location,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    @Inject("BaseURL") public BaseURL
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.dishservice.getDishIds().subscribe(
      (dishIds) => (this.dishIds = dishIds),
      (errmess) => (this.errMess = <any>errmess)
    );
    this.route.params
      .pipe(
        switchMap((params: Params) => this.dishservice.getDish(params["id"]))
      )
      .subscribe(
        (dish) => {
          this.dish = dish;
          this.setPrevNext(dish.id);
        },
        (errmess) => (this.errMess = <any>errmess)
      );
  }
  createForm() {
    this.commentForm = this.fb.group({
      author: ["", [Validators.required, Validators.minLength(2)]],
      rating: [5, [Validators.required]],
      comment: ["", [Validators.required]],
    });
    this.commentForm.valueChanges.subscribe((data) =>
      this.onValueChanged(data)
    );
    this.onValueChanged();
  }
  onValueChanged(data?: any) {
    if (!this.commentForm) {
      return;
    }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        this.formErrors[field] = "";
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + "";
            }
          }
        }
      }
    }
  }
  validationMessages = {
    author: {
      required: "Author Name is required",
      minlength: "Author Name must be at least 2 characters long.",
    },
    rating: {
      required: "Rating is required",
    },
    comment: {
      required: "Comment Name is required",
    },
  };
  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[
      (this.dishIds.length + index - 1) % this.dishIds.length
    ];
    this.next = this.dishIds[
      (this.dishIds.length + index + 1) % this.dishIds.length
    ];
  }
  goBack(): void {
    this.location.back();
  }
  onSubmit() {
    //commentForm does not have date attribute
    this.comment = this.commentForm.value;
    console.log(this.comment);
    var d = new Date();
    const ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
    const mo = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
    const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);
    const date = mo + " " + da + "," + ye;
    this.comment.date = date;
    this.dish.comments.push(this.comment);

    this.commentForm.reset({
      author: "",
      rating: "5",
      comment: "",
    });
    this.commentFormDirective.resetForm();
  }
}
